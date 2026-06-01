# Login 功能施工計畫

## 背景

Civic Talk 目前是 Cloudflare Pages + 靜態 HTML/CSS/JS + Pages Functions + D1 的架構。每個頁面都是獨立 HTML，這不妨礙實作登入；真正需要避免的是只把登入狀態存在前端，例如 `sessionStorage` 或單純的前端 token。

建議登入狀態改由後端建立 session，並透過 `HttpOnly` cookie 維持。每個獨立 HTML 頁面載入時呼叫 `/api/auth/me`，即可取得目前使用者與權限。

## 目標

- 短期導入 Hono 管理 API 路由與 OAuth 登入流程。
- 中期再評估 Cloudflare Access 作為管理後台的額外保護層。
- 保留目前靜態 HTML 架構，不引入前端框架。
- 使用 Cloudflare D1 儲存使用者與 session，不混用 Firebase Auth。
- 為未來角色權限建立基礎：一般使用者、志願者、管理員。

## 非目標

- 不在此階段導入 React、Vue 或 SPA 架構。
- 不讓平台伺服器端呼叫 AI API。
- 不先做完整會員中心、密碼登入、密碼重設。
- 不用 Firebase 作為主要身份系統，避免 Cloudflare D1 與 Firebase Auth 雙系統同步成本。

## 短期方案：Hono + Google OAuth + D1 Session

短期目標是把 API 路由改成 Hono 管理，並加入正式的使用者登入系統。這條路會比只上 Cloudflare Access 工程量更高，但能直接解決一般使用者登入、角色權限與投稿關聯問題。

### 核心流程

```text
使用者點「使用 Google 登入」
  -> GET /api/auth/google
  -> 轉向 Google OAuth consent screen
  -> GET /api/auth/google/callback
  -> 驗證 OAuth state 與 Google 回傳 code
  -> 向 Google 換取 token
  -> 取得 Google userinfo
  -> 建立或更新 D1 users
  -> 建立 D1 sessions
  -> Set-Cookie: civic_session=...
  -> redirect 回原本頁面

頁面載入
  -> GET /api/auth/me
  -> 回傳目前使用者或 null

使用者登出
  -> POST /api/auth/logout
  -> 刪除 session
  -> 清除 cookie
```

### 建議新增環境變數

Cloudflare Pages Functions 設定：

```text
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
AUTH_SECRET
AUTH_REDIRECT_BASE_URL
```

說明：

- `GOOGLE_CLIENT_ID`：Google OAuth client ID。
- `GOOGLE_CLIENT_SECRET`：Google OAuth client secret。
- `AUTH_SECRET`：簽章、state、cookie 相關用途的隨機長字串。
- `AUTH_REDIRECT_BASE_URL`：正式環境網址，例如 `https://civic-talk.example.com`。

### 建議資料表

```sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider TEXT NOT NULL,
  provider_user_id TEXT NOT NULL,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(provider, provider_user_id)
);

CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

後續再把投稿資料與使用者關聯：

```sql
ALTER TABLE materials ADD COLUMN submitted_by INTEGER REFERENCES users(id);
ALTER TABLE opinions ADD COLUMN submitted_by INTEGER REFERENCES users(id);
ALTER TABLE briefings ADD COLUMN created_by INTEGER REFERENCES users(id);
```

### Cookie 策略

session cookie 建議：

```text
Name: civic_session
HttpOnly: true
Secure: true
SameSite: Lax
Path: /
Max-Age: 30 days
```

只把隨機 session token 放在 cookie，D1 只儲存 token hash，不儲存明文 token。

### Hono 路由設計

建議逐步把 `functions/api/[[route]].js` 改為 Hono app：

```text
GET  /api/auth/google
GET  /api/auth/google/callback
GET  /api/auth/me
POST /api/auth/logout

GET  /api/issues
POST /api/issues
GET  /api/issues/:id
POST /api/issues/:id/materials
POST /api/issues/:id/opinions
POST /api/issues/:id/briefing

GET  /api/admin/stats
PUT  /api/admin/issues/:id
DELETE /api/admin/issues/:id
DELETE /api/admin/materials/:id
DELETE /api/admin/opinions/:id
```

路由分組：

- `/api/auth/*`：登入、登出、目前使用者。
- `/api/issues/*`：公開資料與一般使用者互動。
- `/api/admin/*`：管理功能，只允許 `role = 'admin'`。

### 權限模型

第一版可先使用單欄位 `users.role`：

```text
user       一般登入使用者，可提交意見
volunteer  志願者，可提交素材與 briefing
admin      管理員，可編輯與刪除資料
```

權限檢查規則：

- 未登入者：可瀏覽議題、素材、briefing、公開意見。
- `user`：可提交個人意見。
- `volunteer`：可提交素材、提交 briefing、使用志願者工具。
- `admin`：可進入管理後台、編輯與刪除資料。

### 前端頁面調整

不需要改成 SPA。每個頁面共用一段簡單的 auth helper 即可：

```text
public/auth.js
```

功能：

- `getCurrentUser()`：呼叫 `/api/auth/me`。
- `renderAuthNav()`：在頁首顯示登入、登出、使用者名稱。
- `requireLogin()`：提交意見或素材前檢查登入。
- `requireRole(role)`：志願者或管理功能前檢查角色。

各頁調整：

- `index.html`：顯示登入狀態。
- `issue.html`：提交意見前要求登入；志願者工具依角色顯示。
- `contribute.html`：提交素材前要求 `volunteer` 或 `admin`。
- `admin.html`：短期改為檢查 `/api/auth/me` 的 `role = 'admin'`，不再使用密碼登入表單。

### Hono 套件選擇

建議優先使用：

```text
hono
```

OAuth 可以有兩種作法：

1. 使用 Hono middleware 或 helper 處理 OAuth 流程。
2. 自行實作 Google OAuth code exchange，保持依賴最少。

此專案目前依賴很少，建議第一版可以自行實作 Google OAuth 流程，只引入 `hono`。若後續 provider 變多，再考慮抽象化。

## 中期方案：Cloudflare Access 保護管理後台

中期目標是在自建登入系統穩定後，再評估是否用 Cloudflare Access 為管理後台加一層外部保護。這不是一般使用者登入的主方案，而是管理入口的防護層。

### 適用範圍

- `public/admin.html`
- `/api/admin/*`
- 管理型 API，例如編輯議題、刪除素材、刪除意見、編輯 briefing

### Cloudflare Access 設定

1. 在 Cloudflare Zero Trust 建立 Access Application。
2. Application domain 指向管理後台路徑，例如：
   - `https://<domain>/admin.html`
   - `https://<domain>/api/admin/*`
3. Identity provider 先使用 Google。
4. Policy 限制可登入的 Google 帳號或網域。
5. 將管理者 email 加入 allow list。

### API 調整方向

管理 API 仍以 Hono session 與 `role = 'admin'` 作為產品內權限來源。Cloudflare Access 若導入，應作為額外入口限制：

- 管理端點集中到 `/api/admin/*`。
- Cloudflare Access 保護 `/api/admin/*`。
- Pages Function 內可讀取 Access JWT identity，必要時比對登入者 email。
- 完全淘汰 `ADMIN_PASSWORD` 與 `X-Admin-Token`。

### 中期優點

- 管理後台多一層 Cloudflare 閘門。
- 可限制只有特定 Google 帳號或網域能進入管理入口。
- 即使產品內 session 有漏洞，管理入口仍有外部保護。

### 中期限制

- 不適合一般使用者自由登入。
- 不適合做平台內使用者 profile。
- 不適合追蹤投稿者、意見提交者、志願者權限。
- Cloudflare Access 比較像閘門，不是完整產品會員系統。

## 施工階段

### Phase 1：D1 auth schema

1. 新增 `users`、`sessions` 資料表。
2. 新增 `materials.submitted_by`、`opinions.submitted_by`、`briefings.created_by`。
3. 補一個 seed 或手動 SQL，將指定 email 設為 `admin`。

### Phase 2：Hono API 基礎重構

1. 安裝 `hono`。
2. 將 Pages Function 入口改為 Hono app。
3. 保持既有 API response 格式不變。
4. 先確保議題列表、議題詳情、素材、意見、prompt 端點行為不變。

### Phase 3：Google OAuth

1. 建立 `/api/auth/google`。
2. 建立 OAuth state cookie，避免 CSRF。
3. 建立 `/api/auth/google/callback`。
4. 換取 Google token 並取得 userinfo。
5. upsert `users`。
6. 建立 session，寫入 `civic_session` cookie。
7. 建立 `/api/auth/me` 與 `/api/auth/logout`。

### Phase 4：權限與前端整合

1. 新增 `public/auth.js`。
2. 各頁 header 顯示登入狀態。
3. `issue.html` 提交意見前要求登入。
4. `contribute.html` 提交素材前要求 `volunteer` 或 `admin`。
5. `admin.html` 改為 role-based access，不再使用前端密碼登入。
6. 管理 API 改檢查 session user role。

### Phase 5：Cloudflare Access 管理入口加固

1. 在 Cloudflare Access 建立管理後台保護規則。
2. 確認 `/api/admin/*` 已集中管理功能。
3. 確認只有允許的 Google 帳號可進入 `admin.html`。
4. 確認未授權者無法呼叫管理 API。
5. 移除 `ADMIN_PASSWORD` 與 `X-Admin-Token` 相關過渡程式碼。

## 驗收清單

- 未登入者可以瀏覽公開頁面。
- 未登入者不能提交意見或素材。
- 使用者可用 Google 登入。
- 登入後重新整理不同 HTML 頁面仍維持登入狀態。
- `/api/auth/me` 可正確回傳目前使用者。
- 登出後 session cookie 被清除。
- 一般使用者不能呼叫管理 API。
- `admin` 可以進入管理後台並執行管理操作。
- session token 不以明文存入 D1。
- cookie 設定包含 `HttpOnly`、`Secure`、`SameSite=Lax`。

## 風險與注意事項

- Google OAuth callback URL 必須與 Cloudflare Pages 正式網址一致。
- 本地開發需要處理 `localhost` redirect URI。
- D1 session 查詢會出現在每個需要身份的 API，應封裝成共用 helper。
- 如果要支援匿名提交，資料表需允許 `submitted_by` 為 `NULL`，並清楚標示匿名與登入投稿。
- 如果 Cloudflare Access 與自建 session 同時存在，需明確切分：Access 保護管理入口，自建 session 管產品內身份。

## 建議決策

短期採用 Hono + Google OAuth + D1 session，作為平台正式使用者登入系統。這條路最符合目前 Cloudflare-first 的專案方向，也能保留靜態 HTML 的簡單性。

中期再用 Cloudflare Access 把管理後台額外鎖起來，降低管理入口暴露風險。
