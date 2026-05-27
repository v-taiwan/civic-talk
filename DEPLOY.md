# Civic Talk 部署指南

## 先決條件

1. 安裝 Node.js（v18+）
2. 有 Cloudflare 帳號（免費即可）
3. 安裝 Wrangler CLI

```bash
npm install -g wrangler
wrangler login
```

---

## 部署步驟

### 1. 建立 D1 資料庫

```bash
npm run db:create
```

複製輸出中的 `database_id`，填入 `wrangler.toml`：

```toml
database_id = "貼上你的 ID"
```

### 2. 建立資料表 & 匯入示範資料

本地測試：
```bash
npm run db:migrate
```

正式環境：
```bash
npm run db:migrate:prod
```

### 3. 本地開發

```bash
npm run dev
```

打開 http://localhost:8787 查看結果。

### 4. 部署到 Cloudflare

```bash
npm run deploy
```

Cloudflare 會自動分配一個 `*.workers.dev` 的域名。
你也可以在 Cloudflare Dashboard 綁定自訂網域。

---

## 檔案結構說明

```
civic-talk/
├── public/            ← 靜態前端（Cloudflare Pages 托管）
│   ├── index.html     議題列表首頁
│   ├── issue.html     議題詳情（說明頁 / 素材庫 / 志願者工具 / 意見）
│   ├── contribute.html 素材提交頁
│   └── style.css      全站樣式
├── worker/
│   └── index.js       Cloudflare Worker（API 後端）
├── schema.sql         資料庫 schema + 示範資料
├── wrangler.toml      Cloudflare 部署設定
└── package.json
```

---

## API 端點總覽

| 方法   | 路徑                              | 說明                        |
|--------|-----------------------------------|-----------------------------|
| GET    | /api/issues                       | 議題列表                    |
| POST   | /api/issues                       | 建立議題                    |
| GET    | /api/issues/:id                   | 議題詳情（含素材、說明、意見）|
| GET    | /api/issues/:id/materials         | 素材列表                    |
| POST   | /api/issues/:id/materials         | 提交素材                    |
| GET    | /api/issues/:id/briefing          | 取得最新說明頁              |
| POST   | /api/issues/:id/briefing          | 提交說明頁（志願者）        |
| GET    | /api/issues/:id/opinions          | 意見列表                    |
| POST   | /api/issues/:id/opinions          | 提交個人意見摘要            |
| GET    | /api/issues/:id/prompt?type=...   | 生成 AI 彙整 prompt         |

prompt type 可選：`summarize`（共識/爭點/立場）、`narrative`（一頁式說明）、`synthesis`（再彙整）

---

## GitHub Pages 替代方案

如果你不想用 Cloudflare Workers，可以改用以下組合：
- **前端**：GitHub Pages（免費靜態托管）
- **後端**：[Supabase](https://supabase.com)（免費 PostgreSQL + REST API）

這需要把 `worker/index.js` 改寫為 Supabase SDK 呼叫，
並把前端的 `/api/...` 改為 Supabase 的 REST 端點。
這個版本的 code 是 Cloudflare 優先，Supabase 版本可另外生成。
