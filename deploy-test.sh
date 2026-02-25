set -ex

git pull
pnpm i

export NODE_ENV=production

pnpm build

# regular
pm2 restart avoidai-web-test

# first deploy
#pm2 del avoidai-web-test
#pm2 start "NODE_ENV=production pnpm start -p 4000" --name "avoidai-web-test"
