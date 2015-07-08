FROM node:0.11.16
RUN npm install -g gulp mocha pm2 tsd
RUN mkdir /app
WORKDIR /app