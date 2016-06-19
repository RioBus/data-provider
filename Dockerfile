FROM node:6.2.2
ADD . /app
WORKDIR /app
RUN npm install
ENTRYPOINT npm start
