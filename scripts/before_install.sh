#!/bin/bash

#download node and NPM LTS
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

npm install --global yarn

#install PM2
npm install pm2 -g

#create our working directory if it doesnt exist
DIR="/opt/thoth"
if [ -d "$DIR" ]; then
  echo "${DIR} exists"
else
  echo "Creating ${DIR} directory"
  mkdir ${DIR}
fi