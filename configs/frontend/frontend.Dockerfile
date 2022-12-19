# FROM node:alpine

# EXPOSE 3000

# WORKDIR /app

# COPY ./frontend /app/

# RUN ["npm", "ci"]

# ENTRYPOINT [ "npm", "start" ]

FROM node:alpine AS build
WORKDIR /build

COPY ./frontend/package.json            package.json
COPY ./frontend/package-lock.json       package-lock.json

RUN npm ci

ARG REACT_APP_AUTH_SERVICE_URL
ARG REACT_APP_LISTING_SERVICE_URL
ARG REACT_APP_USER_SERVICE_URL

ENV REACT_APP_AUTH_SERVICE_URL=$REACT_APP_AUTH_SERVICE_URL
ENV REACT_APP_LISTING_SERVICE_URL=$REACT_APP_LISTING_SERVICE_URL
ENV REACT_APP_USER_SERVICE_URL=$REACT_APP_USER_SERVICE_URL

COPY ./frontend/.prettierrc.js          .prettierrc.js 
COPY ./frontend/.eslintrc.js            .eslintrc.js
COPY ./frontend/tsconfig.json           tsconfig.json

COPY ./frontend/public                  public/
COPY ./frontend/src                     src/

RUN npm run build

FROM node:alpine

WORKDIR /var/www/html

COPY --from=build /build/build/ ./build


RUN npm install -g serve

EXPOSE 3000

CMD [ "serve", "-p", "3000", "-s", "build" ]
