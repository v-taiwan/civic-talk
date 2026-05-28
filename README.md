# 🗣️ Civic Talk

**用 AI 降低審議民主成本的公民議題討論平台**

讓一般人也能在 15 分鐘內真正參與公共議題討論，而不只是選邊站。

---

## 專案介紹

Civic Talk 是一個實驗性的公民審議平台，核心設計理念是：

- **廣度優先的中立性**：不同立場、甚至可信度有爭議的來源都納入，讓讀者看到議題上真實存在的各種聲音
- **平台不呼叫 AI API**：素材彙整與說明頁生成全由志願者用自己的 AI token 完成（Claude、ChatGPT、Gemini 皆可），閒置算力轉為公共資源
- **輸出立場地圖，不輸出結論**：平台的角色是呈現，每個人看完後的判斷由自己決定

---

## 運作流程

整個平台分三個大階段，共五個步驟，持續循環：

```
INFORM（建立資訊基礎）
  Step 1：志願者收集素材（直接貼上原文，不過濾立場）
  Step 2：志願者用自己的 AI 生成彙整（共識、爭點、立場地圖）
  Step 3：志願者用自己的 AI 生成一頁式說明頁

OPINION（引導個人參與）
  Step 4：讀者下載 OPINION.md，貼到自己的 AI 對話，
          聊完後把 AI 幫整理的意見摘要回傳平台

SYNTHESIS（匯聚與反饋）
  Step 5：累積足夠意見後再跑一次 AI 彙整，更新說明頁
          ↺ 新素材 → 重新彙整 → 更新說明頁 → 吸引更多參與
```

---

## 技術架構

| 層次 | 技術 | 說明 |
|------|------|------|
| 前端 | 靜態 HTML / CSS / JS | 無框架，零依賴，直接部署 |
| 後端 API | Cloudflare Pages Functions | `/functions/api/[[route]].js` |
| 資料庫 | Cloudflare D1（SQLite） | 免費方案足夠 MVP 使用 |
| 部署 | Cloudflare Pages | 連接 GitHub，自動部署 |

**伺服器端不呼叫任何 AI API**，所有 AI 運算由志願者自行完成。

---

## 資料夾結構

```
civic-talk/
├── public/                  ← 靜態前端
│   ├── index.html           議題列表首頁
│   ├── issue.html           議題詳情（說明頁 / 素材庫 / 志願者工具 / 意見）
│   ├── contribute.html      素材提交頁
│   └── style.css            全站樣式
├── functions/
│   └── api/
│       └── [[route]].js     ← Cloudflare Pages Functions API
├── schema.sql               資料庫建表語句 + 示範資料
├── wrangler.toml            Cloudflare 設定
├── setup.sh                 CLI 一鍵部署腳本（進階用）
└── README.md
```

---

## 部署方式（GitHub + Cloudflare Pages 網頁操作）

### 前置：需要的帳號
- [GitHub 帳號](https://github.com)（免費）
- [Cloudflare 帳號](https://dash.cloudflare.com)（免費）

### Step 1：把專案推上 GitHub

1. 打開 **GitHub Desktop**
2. 選「Add an Existing Repository from your Hard Drive」
3. 選擇 `civic-talk` 資料夾
4. 點「Publish repository」→ 設為 Private（建議）→ 確認推上去

### Step 2：在 Cloudflare 建立 D1 資料庫

1. 登入 [dash.cloudflare.com](https://dash.cloudflare.com)
2. 左側選單 → **D1 SQL Database** → **Create database**
3. 資料庫名稱輸入：`civic-talk-db` → Create
4. 進入資料庫頁面 → 點「Console」分頁
5. 把 `schema.sql` 全文複製貼上 → 點「Execute」
6. 確認左側 Tables 出現 `issues`、`materials`、`briefings`、`opinions` 四張表

### Step 3：建立 Cloudflare Pages 專案

1. 左側選單 → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. 選擇你的 GitHub 帳號 → 選 `civic-talk` repo → Begin setup
3. 設定如下：
   - Framework preset：**None**
   - Build command：（留空）
   - Build output directory：`public`
4. 點「Save and Deploy」→ 等待部署完成（約 30 秒）

### Step 4：綁定 D1 資料庫

1. 進入剛建立的 Pages 專案 → **Settings** → **Functions**
2. 往下捲到「D1 database bindings」→ 點「Add binding」
3. Variable name 填：`DB`
4. 選擇資料庫：`civic-talk-db`
5. 點 Save → 回到 Deployments，點「Retry deployment」重新部署

### Step 5：確認上線

部署完成後，Cloudflare 會提供一個 `*.pages.dev` 的網址。
打開網址，應該看到 Civic Talk 首頁，以及預載的「核能重啟爭議」示範議題。

---

## API 端點

| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/api/issues` | 議題列表 |
| POST | `/api/issues` | 建立新議題 |
| GET | `/api/issues/:id` | 議題詳情（含素材、說明頁、意見） |
| POST | `/api/issues/:id/materials` | 提交素材 |
| GET | `/api/issues/:id/briefing` | 取得最新說明頁 |
| POST | `/api/issues/:id/briefing` | 提交說明頁（志願者） |
| POST | `/api/issues/:id/opinions` | 提交個人意見摘要 |
| GET | `/api/issues/:id/prompt?type=` | 生成 AI 彙整 Prompt |

`prompt` 的 `type` 參數：`summarize`（彙整素材）、`narrative`（生成說明頁）、`synthesis`（再彙整意見）

---

## 志願者使用流程

1. 在任意議題頁面，切換到「志願者工具」分頁
2. 點「生成彙整 Prompt」→ 複製 prompt
3. 貼到你的 Claude / ChatGPT / Gemini
4. 把 AI 輸出結果貼回平台對應欄位
5. 素材足夠後重複上述步驟生成說明頁

---

## 讀者參與流程

1. 閱讀議題說明頁
2. 點「下載 OPINION.md」
3. 把 OPINION.md 全文貼到你的 AI chatbot
4. 和 AI 聊這個議題，釐清自己的觀點
5. 請 AI 幫你整理意見摘要，貼回平台


---

## 設計理念延伸閱讀

原始設計文件：[civic-talk 構想](https://ronnywang.github.io/civic-notes/civic-talk/)

相關社群：g0v Slack `#vTaiwan` 頻道（[join.g0v.tw](https://join.g0v.tw)）

感謝 ronny wang 提供初步實作的概念並授權社群使用。

---

## License


MIT
