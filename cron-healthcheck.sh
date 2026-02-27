#!/bin/bash
APP_NAME="avoid-ai-web"
PORT="8008"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="/tmp/${APP_NAME}-cron.log"


# 检查应用是否健康
if ! curl -s -f -o /dev/null --max-time 5 http://47.82.165.65:8008:${PORT}; then
    echo "[$(date)] 应用无响应，尝试重启" >> ${LOG_FILE}
    
    # 检查 PM2 状态
    if pm2 describe ${APP_NAME} > /dev/null 2>&1; then
        pm2 restart ${APP_NAME} >> ${LOG_FILE} 2>&1
    else
        # 如果进程不存在，重新启动
        cd ${SCRIPT_DIR}
        export NODE_ENV=production
        pm2 start "NODE_ENV=production PORT='${PORT}' pnpm start" --name ${APP_NAME} >> ${LOG_FILE} 2>&1
    fi
    
    echo "[$(date)] 重启完成" >> ${LOG_FILE}
else
    # 可选：记录正常状态
    # echo "[$(date)] 应用正常" >> ${LOG_FILE}
    exit 0
fi
