#!/bin/bash

#give permission for everything in the thoth directory
sudo chmod -R 777 /opt/thoth

#navigate into our working directory where we have all our github files
cd /opt/thoth


#install node modules
yarn install

cp /etc/letsencrypt/live/thoth.n3xus.city/privkey.pem /opt/thoth/client/certs/key.pem
cp /etc/letsencrypt/live/thoth.n3xus.city/cert.pem /opt/thoth/client/certs/cert.pem

cp /etc/letsencrypt/live/thoth.n3xus.city/privkey.pem /opt/thoth/server/certs/key.pem
cp /etc/letsencrypt/live/thoth.n3xus.city/cert.pem /opt/thoth/server/certs/cert.pem

cp /opt/thoth_env/server/.env /opt/thoth/server/.env
cp /opt/thoth_env/client/.env /opt/thoth/client/.env
cp /opt/thoth_env/core/.env /opt/thoth/core/.env

#start our node app in the background using PM2
#pm2 --name thoth start "yarn run dev"
pm2 restart all