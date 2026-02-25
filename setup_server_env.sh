#!/usr/bin/env bash
set -euo pipefail

# ====== configurable versions ======
NODE_MAJOR="18"     # 18.x
PNPM_VERSION="9"    # 9.x
# ================================

echo "[1/4] apt update & base packages"
sudo apt-get update -y
sudo apt-get install -y git curl ca-certificates nginx

echo "[2/4] install Node.js ${NODE_MAJOR}.x (NodeSource)"
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo "[3/4] install pnpm@${PNPM_VERSION}"
if ! command -v pnpm >/dev/null 2>&1; then
  sudo npm i -g "pnpm@${PNPM_VERSION}"
fi

echo "[4/4] install pm2"
if ! command -v pm2 >/dev/null 2>&1; then
  sudo npm i -g pm2
fi

echo "DONE. Versions:"
node -v
pnpm -v
pm2 -v
nginx -v
