#!/bin/bash
APP_NAME="avoid-ai-web"
PORT="8008"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo '开始收集日志'


# 检查应用是否健康
if ! curl -s -f -o /dev/null --max-time 5 http://47.82.165.65:${PORT}; then
    echo "[$(date)] 应用无响应，尝试重启"
    
    # 检查 PM2 状态
    if pm2 describe ${APP_NAME} > /dev/null 2>&1; then
        pm2 restart ${APP_NAME}
    else
        # 如果进程不存在，重新启动
        cd ${SCRIPT_DIR}
        export NODE_ENV=production
        pm2 start "NODE_ENV=production PORT='${PORT}' pnpm start" --name ${APP_NAME}
    fi
    echo "[$(date)] 重启完成"
else
    # 可选：记录正常状态
    echo "[$(date)] 应用正常"
    exit 0
fi
