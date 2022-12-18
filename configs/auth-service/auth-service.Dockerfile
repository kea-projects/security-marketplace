FROM node:alpine

EXPOSE 8080

WORKDIR /app

COPY ./auth-service /app/

RUN ["npm", "ci"]

ENTRYPOINT [ "npm", "run", "start:dev" ]