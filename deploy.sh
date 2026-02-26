#!/bin/bash
set -ex

# 拉取最新代码 
git pull
# 安装依赖
pnpm i

# 配置区（可以修改）
APP_NAME="avoid-ai-web"
PORT="8008"

# 行为1：start
ACTION=$1

# 构建
export NODE_ENV=production
pnpm build

# 停用旧进程（忽略错误）
pm2 del ${APP_NAME}

# 启动新进程
pm2 ${ACTION} "NODE_ENV=production PORT='${PORT}' pnpm ${ACTION}" --name ${APP_NAME}
echo "=== 部署完成 ==="
pm2 list | grep ${APP_NAME}
