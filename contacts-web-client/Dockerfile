FROM node:alpine AS build

WORKDIR /usr/src/app

COPY . /usr/src/app

RUN npm install --force

RUN npm run build

FROM nginx:latest
COPY --from=build /usr/src/app/dist/contacts-web-client/browser /usr/share/nginx/html
