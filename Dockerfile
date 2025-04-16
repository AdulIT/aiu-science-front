# Dockerfile
FROM node:20.19.0-alpine

# create destination directory
WORKDIR /usr/src/app

# update and install dependency
RUN apk update && apk upgrade
RUN apk add git

# copy the app, note .dockerignore
COPY . /usr/src/app/
RUN npm install
RUN npm run build

EXPOSE 3000
