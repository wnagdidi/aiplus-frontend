module.exports = {
  apps: [
    {
      name: 'avoid-ai-web',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/avoid-ai-web/aiplus-frontend',
      interpreter: 'none',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      // 根据你的服务器配置调整
      instances: 'max',  // 使用所有 CPU 核心
      exec_mode: 'cluster',
      max_memory_restart: '1G',  // 内存超过 1GB 自动重启
      watch: false,
      ignore_watch: [
        'node_modules',
        'logs',
        '.git',
        '.next/cache'
      ],
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: '/var/www/avoid-ai-web/aiplus-frontend/logs/app-error.log',
      out_file: '/var/www/avoid-ai-web/aiplus-frontend/logs/app-out.log',
      pid_file: '/var/www/avoid-ai-web/aiplus-frontend/logs/app.pid',
      autorestart: true,
      restart_delay: 5000,
      max_restarts: 10,
      min_uptime: '10s',
      listen_timeout: 8000,
      kill_timeout: 16000,
      wait_ready: true,
      shutdown_with_message: true,
      // Next.js 特定配置
      env: {
        // 禁用 Next.js 开发模式
        NEXT_TELEMETRY_DISABLED: '1',
        // 优化构建
        NEXT_BUILD_INDICATOR: 'false'
      }
    }
  ]
};