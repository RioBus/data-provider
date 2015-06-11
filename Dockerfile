FROM base/archlinux

MAINTAINER Frederico Souza <fredericoamsouza@gmail.com>

RUN pacman -Sy --noconfirm git nodejs npm
RUN npm install -g n
RUN n 0.10
RUN npm install -g gulp tsd mocha pm2

WORKDIR /

CMD ["bash"]