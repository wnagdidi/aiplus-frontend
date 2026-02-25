#!/usr/bin/env bash
set -euo pipefail

### ====== required config ======
APP_NAME="aiplusapp-web"          # pm2 app name
APP_DIR="/var/www/aiplusapp-web"  # code directory (already deployed manually)
PORT="3000"                    # Next.js port
RUN_USER="ubuntu"              # run as ubuntu user
RUN_GROUP="ubuntu"

# Use server IP for now; later switch to a domain.
SERVER_NAME="_"                # set to your server IP if you want: "1.2.3.4"
NGINX_SITE_NAME="aiplusapp-web"

# Environment file used for production
ENV_FILE=".env.production"
### =============================

if [ ! -d "$APP_DIR" ]; then
  echo "ERROR: APP_DIR not found: $APP_DIR"
  exit 1
fi

if [ ! -f "$APP_DIR/$ENV_FILE" ]; then
  echo "ERROR: env file not found: $APP_DIR/$ENV_FILE"
  exit 1
fi

echo "[1/6] ensure permissions"
sudo chown -R "$RUN_USER":"$RUN_GROUP" "$APP_DIR"

echo "[2/6] install dependencies"
sudo -u "$RUN_USER" bash -lc "cd '$APP_DIR' && pnpm install --frozen-lockfile"

echo "[3/6] build (production)"
sudo -u "$RUN_USER" bash -lc "cd '$APP_DIR' && set -a && source '$ENV_FILE' && set +a && NODE_ENV=production pnpm build"

echo "[4/6] start/restart with pm2"
# avoid duplicates
sudo -u "$RUN_USER" bash -lc "pm2 delete '$APP_NAME' || true"

sudo -u "$RUN_USER" bash -lc "cd '$APP_DIR' && set -a && source '$ENV_FILE' && set +a && NODE_ENV=production PORT='$PORT' pm2 start pnpm --name '$APP_NAME' -- start"

sudo -u "$RUN_USER" bash -lc "pm2 save"

echo "[5/6] pm2 startup (systemd)"
STARTUP_CMD=$(sudo -u "$RUN_USER" bash -lc "pm2 startup systemd -u '$RUN_USER' --hp '/home/$RUN_USER' | tail -n 1" || true)
if [[ -n "${STARTUP_CMD:-}" ]]; then
  sudo bash -lc "$STARTUP_CMD"
fi

echo "[6/6] nginx reverse proxy"
NGINX_AVAIL="/etc/nginx/sites-available/${NGINX_SITE_NAME}"
NGINX_ENABLED="/etc/nginx/sites-enabled/${NGINX_SITE_NAME}"

sudo tee "$NGINX_AVAIL" >/dev/null <<EOF
server {
  listen 80;
  server_name ${SERVER_NAME};

  location / {
    proxy_pass http://127.0.0.1:${PORT};
    proxy_http_version 1.1;

    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;

    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
EOF

if [ -e /etc/nginx/sites-enabled/default ]; then
  sudo rm -f /etc/nginx/sites-enabled/default
fi

if [ ! -e "$NGINX_ENABLED" ]; then
  sudo ln -s "$NGINX_AVAIL" "$NGINX_ENABLED"
fi

sudo nginx -t
sudo systemctl reload nginx

echo "DONE."
echo "- App (local):  http://127.0.0.1:${PORT}"
echo "- Nginx:        http://<server-ip>/"
echo "- PM2 status:   sudo -u ${RUN_USER} pm2 status"
