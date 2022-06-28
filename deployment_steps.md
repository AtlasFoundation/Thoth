# Thoth Deployment steps

1. Setup AWS CICD (https://docs.aws.amazon.com/codepipeline/latest/userguide/pipelines.html)

2. Login aws EC2 server using ssh

3. Install node js (https://github.com/nodesource/distributions#debinstall)
4. Install pm2 (https://pm2.keymetrics.io/) and run pm2 startup command

5. Install docker (https://docs.docker.com/engine/install)

6. Generate SSL certificate -` sudo certbot certonly --standalone --agree-tos --preferred-challenges http -d <domainName>`

   sudo certbot certonly --manual --agree-tos --preferred-challenges dns -d superreality.com,thoth.superreality.com

7. Go to the project root path
8. Copy certificates

   - Copy generated certificates into client dir. (tooth/client/certs)
     - `cp /etc/letsencrypt/live/superreality.com-0001/privkey.pem /opt/thoth/packages/client/certs/key.pem`
     - `sudo cp /etc/letsencrypt/live/superreality.com-0001/cert.pem /opt/thoth/packages/client/certs/cert.pem`
   - Copy generated certificates into server dir. (tooth/server/certs)
     - `sudo cp /etc/letsencrypt/live/superreality.com-0001/privkey.pem /opt/thoth/packages/server/certs/key.pem`
     - `sudo cp /etc/letsencrypt/live/superreality.com-0001/cert.pem /opt/thoth/packages/server/certs/cert.pem`

9. Open client .env file (vim client/.env).

- Change following env params REACT_APP_LAPI_ROOT_URL, REACT_APP_API_ROOT_URL, REACT_APP_API_ROOT_URL_PROD, REACT_APP_CORS_URL, REACT_APP_API_URL,REACT_APP_SEARCH_FILE_URL

10. Open core .env file (vim client/.env).

- Change following env params REACT_APP_API_ROOT_URL, API_URL

11. Open server .env file (vim client/.env).

- Change following .env params API_URL, PGUSER, PGHOST, PGPASSWORD, PGDATABASE, GOOGLE_APPLICATION_CREDENTIALS, WITAI_KEY, UBER_DUCK_KEY, UBER_DUCK_SECRET_KEY, OPENAI_API_KEY, HF_API_KEY
  Note: In GOOGLE_APPLICATION_CREDENTIALS set path of credential json file

12. Run following commands
    - `pm2 --name thoth start "yarn run dev"`
    - `pm2 save`
