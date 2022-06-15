# Thoth Deployment steps

1) Setup AWS CICD (https://docs.aws.amazon.com/codepipeline/latest/userguide/pipelines.html)

2) Login aws EC2 server using ssh

3) Install node js (https://github.com/nodesource/distributions#debinstall)
   
4) install pm2 (https://pm2.keymetrics.io/) and run pm2 startup command

5) Generate SSL certificate
    -``` sudo certbot certonly --standalone --agree-tos --preferred-challenges http -d <domainName>```

6) Go to the project root path
   
7) Copy certificates
    - Copy generated certificates into client dir. (tooth/client/certs)
      - ```cp /etc/letsencrypt/live/<domainName>/privkey.pem /opt/thoth/client/certs/key.pem```
      - ```cp /etc/letsencrypt/live/<domainName>/cert.pem /opt/thoth/client/certs/cert.pem```
    - Copy generated certificates into server dir. (tooth/server/certs)
      - ```cp /etc/letsencrypt/live/<domainName>/privkey.pem /opt/thoth/server/certs/key.pem```
      - ```cp /etc/letsencrypt/live/<domainName>/cert.pem /opt/thoth/server/certs/cert.pem```

8)  Open client .env file (vim client/.env).
   - Change following env params REACT_APP_LAPI_ROOT_URL, REACT_APP_API_ROOT_URL, REACT_APP_API_ROOT_URL_PROD, REACT_APP_CORS_URL, REACT_APP_API_URL,REACT_APP_SEARCH_FILE_URL

11) Open core .env file (vim client/.env).
   - Change following env params REACT_APP_API_ROOT_URL, API_URL
  
12) Open server .env file (vim client/.env).
   - Change following .env params API_URL, PGUSER, PGHOST, PGPASSWORD, PGDATABASE, GOOGLE_APPLICATION_CREDENTIALS, WITAI_KEY, UBER_DUCK_KEY, UBER_DUCK_SECRET_KEY, OPENAI_API_KEY, HF_API_KEY
   Note: In GOOGLE_APPLICATION_CREDENTIALS set path of credential json file

13) Run following commands
    - ```pm2 --name thoth start "yarn run dev"```
    - ```pm2 save```