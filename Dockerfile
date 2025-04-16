# Dockerfile
FROM node:20.17.0-alpine

# create destination directory
WORKDIR /usr/src/app

RUN apk add --no-cache curl && curl -I https://registry.npmjs.org

# update and install dependency
RUN apk update && apk upgrade
RUN apk add git

# copy the app, note .dockerignore
COPY . /usr/src/app/
RUN npm install -g npm
RUN npm install
RUN npm run build

EXPOSE 3000
