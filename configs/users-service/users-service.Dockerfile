FROM node:alpine

EXPOSE 8082

WORKDIR /app

COPY ./users-service /app/

RUN ["npm", "ci"]

ENTRYPOINT [ "npm", "run", "start:dev" ]