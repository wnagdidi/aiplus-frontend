#!/bin/bash
set -e  # 移除 -x 避免输出过于冗长

# 配置区（可以修改）
APP_NAME="avoid-ai-web"
PORT="8008"

# 函数：显示使用帮助
usage() {
    echo "使用方法: $0 {start|stop|restart|status}"
    exit 1
}

# 函数：启动应用
start() {
    echo "=== 开始启动 ${APP_NAME} ==="
    
    # 拉取最新代码
    echo "拉取最新代码..."
    git pull
    
    # 安装依赖
    echo "安装依赖..."
    pnpm i
    
    # 构建
    echo "构建应用..."
    export NODE_ENV=production
    pnpm build
    
    # 检查是否已经运行
    if pm2 describe ${APP_NAME} > /dev/null 2>&1; then
        echo "应用已在运行，正在重新启动..."
        pm2 restart ${APP_NAME}
    else
        echo "启动新进程..."
        # 启动新进程
        pm2 start "NODE_ENV=production PORT='${PORT}' pnpm start" --name ${APP_NAME}
    fi
    
    echo "=== 启动完成 ==="
    pm2 list | grep ${APP_NAME} || true
}

# 函数：停止应用
stop() {
    echo "=== 开始停止 ${APP_NAME} ==="
    
    if pm2 describe ${APP_NAME} > /dev/null 2>&1; then
        pm2 stop ${APP_NAME}
        pm2 delete ${APP_NAME}
        echo "应用已停止"
    else
        echo "应用未在运行"
    fi
    
    echo "=== 停止完成 ==="
}

# 函数：重启应用
restart() {
    echo "=== 开始重启 ${APP_NAME} ==="
    
    # 拉取最新代码
    echo "拉取最新代码..."
    git pull
    
    # 安装依赖
    echo "安装依赖..."
    pnpm i
    
    # 构建
    echo "构建应用..."
    export NODE_ENV=production
    pnpm build
    
    # 重启应用
    if pm2 describe ${APP_NAME} > /dev/null 2>&1; then
        pm2 restart ${APP_NAME}
        echo "应用已重启"
    else
        echo "应用未运行，正在启动..."
        pm2 start "NODE_ENV=production PORT='${PORT}' pnpm start" --name ${APP_NAME}
    fi
    
    echo "=== 重启完成 ==="
    pm2 list | grep ${APP_NAME} || true
}

# 函数：查看状态
status() {
    echo "=== ${APP_NAME} 状态 ==="
    
    if pm2 describe ${APP_NAME} > /dev/null 2>&1; then
        pm2 show ${APP_NAME}
        echo ""
        pm2 logs ${APP_NAME} --lines 20 --nostream
    else
        echo "应用未运行"
    fi
}

# 主逻辑
case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    status)
        status
        ;;
    *)
        usage
        ;;
esac

exit 0
