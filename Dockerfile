FROM node:latest
EXPOSE 8080
EXPOSE 80
RUN npm install -g pm2
RUN mkdir /app
WORKDIR /app