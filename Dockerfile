FROM l3iggs/archlinux

MAINTAINER Frederico Souza <fredericoamsouza@gmail.com>

# installing and configuring environment
RUN pacman -Sy --noconfirm git nodejs npm

# installing nodejs dependencies
RUN npm install -g n
RUN n 0.10
RUN npm install -g gulp mocha pm2 tsd

RUN mkdir -p /riobus/data-provider
WORKDIR /riobus/data-provider