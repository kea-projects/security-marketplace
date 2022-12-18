FROM node:alpine

EXPOSE 3000

WORKDIR /app

COPY ./frontend /app/

RUN ["npm", "ci"]

ENTRYPOINT [ "npm", "start" ]