#!/bin/bash

#give permission for everything in the thoth directory
sudo chmod -R 777 /opt/thoth

#navigate into our working directory where we have all our github files
cd /opt/thoth


#install node modules
yarn install

#start our node app in the background using PM2
#pm2 --name thoth start "yarn run dev"
pm2 restart all