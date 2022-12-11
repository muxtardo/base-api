echo "CD ..." &&
cd /home/ec2-user/proclamas/proclamas-online-back &&
echo "GIT RESET ..." &&
git reset --hard &&
echo "GIT PULL ..." &&
git pull --rebase &&
echo "DEPENDENCIES ..." &&
yarn &&
echo "BUILD ..." &&
yarn build &&
echo "MIGRATIONS ..." &&
yarn migration:run &&
echo "RESTART PM2 ..." &&
pm2 restart proclamas-api
echo "END ..."
