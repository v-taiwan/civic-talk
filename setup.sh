#!/bin/bash
# ============================================================
#  Civic Talk — 一鍵部署腳本
#  使用方式：bash setup.sh
# ============================================================

set -e   # 任何指令失敗就停止

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

echo ""
echo -e "${BOLD}🗣️  Civic Talk — Cloudflare 部署精靈${NC}"
echo "=================================================="
echo ""

# ── Step 1: 檢查 Node.js ──────────────────────────────────
echo -e "${CYAN}[1/6] 檢查 Node.js...${NC}"

if ! command -v node &> /dev/null; then
  echo -e "${YELLOW}⚠️  找不到 Node.js。"
  echo ""
  echo "請先安裝 Node.js（建議用 nvm）："
  echo ""
  echo "  # 安裝 nvm："
  echo "  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash"
  echo "  source ~/.bashrc   # 或 source ~/.zshrc"
  echo ""
  echo "  # 安裝 Node.js 20："
  echo "  nvm install 20"
  echo "  nvm use 20"
  echo ""
  echo -e "安裝完後重新執行此腳本：  bash setup.sh${NC}"
  exit 1
fi

NODE_VER=$(node -v)
echo -e "${GREEN}✅ Node.js $NODE_VER${NC}"

# ── Step 2: 安裝 Wrangler ────────────────────────────────
echo ""
echo -e "${CYAN}[2/6] 安裝 / 確認 Wrangler CLI...${NC}"

if ! command -v wrangler &> /dev/null; then
  echo "正在安裝 wrangler..."
  npm install -g wrangler
fi

WRANGLER_VER=$(wrangler --version 2>&1 | head -1)
echo -e "${GREEN}✅ $WRANGLER_VER${NC}"

# ── Step 3: 登入 Cloudflare ──────────────────────────────
echo ""
echo -e "${CYAN}[3/6] 登入 Cloudflare 帳號...${NC}"

# 檢查是否已登入
if wrangler whoami &> /dev/null; then
  CF_USER=$(wrangler whoami 2>&1 | grep -o 'You are logged in.*' || echo "已登入")
  echo -e "${GREEN}✅ $CF_USER${NC}"
else
  echo "即將開啟瀏覽器進行 Cloudflare 登入，請按 Enter 繼續..."
  read -r
  wrangler login
  echo -e "${GREEN}✅ 登入成功${NC}"
fi

# ── Step 4: 建立 D1 資料庫 ───────────────────────────────
echo ""
echo -e "${CYAN}[4/6] 建立 D1 資料庫...${NC}"

# 嘗試建立，若已存在就跳過
DB_CREATE_OUTPUT=$(wrangler d1 create civic-talk-db 2>&1 || true)

if echo "$DB_CREATE_OUTPUT" | grep -q "database_id"; then
  # 從輸出取得 database_id
  DB_ID=$(echo "$DB_CREATE_OUTPUT" | grep -o '"[0-9a-f-]\{36\}"' | tr -d '"' | head -1)
  echo -e "${GREEN}✅ D1 資料庫建立成功${NC}"
  echo "   database_id: $DB_ID"

  # 自動更新 wrangler.toml
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/YOUR_D1_DATABASE_ID/$DB_ID/" wrangler.toml
  else
    sed -i "s/YOUR_D1_DATABASE_ID/$DB_ID/" wrangler.toml
  fi
  echo -e "${GREEN}✅ wrangler.toml 已自動更新${NC}"

elif echo "$DB_CREATE_OUTPUT" | grep -qi "already exists"; then
  echo -e "${YELLOW}ℹ️  資料庫 civic-talk-db 已存在，繼續使用現有資料庫${NC}"
  echo ""
  echo "⚠️  請手動確認 wrangler.toml 中的 database_id 是否正確："
  echo "   執行以下指令查看現有資料庫 ID："
  echo "   wrangler d1 list"
  echo ""
  echo "找到 civic-talk-db 的 ID 後，請更新 wrangler.toml 第 8 行的 database_id"
  echo "按 Enter 繼續（確認已更新後）..."
  read -r

else
  echo -e "${RED}建立資料庫時出現問題，輸出如下：${NC}"
  echo "$DB_CREATE_OUTPUT"
  echo ""
  echo "請手動執行：wrangler d1 create civic-talk-db"
  echo "取得 database_id 後填入 wrangler.toml，再重新執行此腳本"
  exit 1
fi

# ── Step 5: 初始化資料庫 (schema + 示範資料) ─────────────
echo ""
echo -e "${CYAN}[5/6] 初始化資料庫（建表 + 示範資料）...${NC}"

echo "→ 寫入本地測試資料庫..."
wrangler d1 execute civic-talk-db --file=schema.sql 2>&1 || true

echo "→ 寫入正式資料庫..."
wrangler d1 execute civic-talk-db --remote --file=schema.sql

echo -e "${GREEN}✅ 資料庫初始化完成${NC}"

# ── Step 6: 部署 ─────────────────────────────────────────
echo ""
echo -e "${CYAN}[6/6] 部署到 Cloudflare Workers...${NC}"

wrangler deploy

echo ""
echo -e "${GREEN}${BOLD}🎉 部署完成！${NC}"
echo ""
echo "=================================================="
echo -e "${BOLD}你的網站網址：${NC}"
echo "  https://civic-talk.<你的subdomain>.workers.dev"
echo ""
echo "請從上面 wrangler deploy 的輸出中找到實際網址"
echo ""
echo -e "${BOLD}下一步建議：${NC}"
echo "  1. 打開網址，確認「核能重啟爭議」示範議題已出現"
echo "  2. 在 Cloudflare Dashboard 綁定自訂網域（選填）"
echo "  3. 開始收集素材，測試完整流程"
echo "=================================================="
