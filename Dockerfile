FROM node

MAINTAINER Daniel Ng <dng@ruelala.com>

RUN mkdir /app

WORKDIR /app

ADD package.json /app

RUN npm install

VOLUME /app
