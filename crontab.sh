#!/bin/bash
# 编辑 crontab
crontab -e

# 添加以下行（每5分钟检查一次）
*/5 * * * * cron-healthcheck.sh
