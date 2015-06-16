FROM l3iggs/archlinux

MAINTAINER Frederico Souza <fredericoamsouza@gmail.com>

# installing and configuring environment
RUN pacman -Sy --noconfirm gcc git make nodejs npm python2
RUN npm config set python python2.7

RUN git config --global user.email "you@example.com"
RUN git config --global user.name "Your Name"

# installing nodejs dependencies
RUN npm install -g n
RUN n 0.11
RUN npm install -g gulp mocha pm2 tsd

RUN mkdir -p /riobus/data-provider
WORKDIR /riobus/data-provider