set -ex

git pull
pnpm i

export NODE_ENV=production

pnpm build

# regular
pm2 restart avoidai-web

# first deploy
#pm2 del avoidai-web
#pm2 start "NODE_ENV=production pnpm start" --name "avoidai-web"
