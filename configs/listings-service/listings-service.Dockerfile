FROM node:alpine

EXPOSE 8081

WORKDIR /app

COPY ./listings-service /app/

RUN ["npm", "ci"]

ENTRYPOINT [ "npm", "run", "start:dev" ]