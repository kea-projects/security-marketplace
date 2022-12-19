# FROM node:alpine

# EXPOSE 8082

# WORKDIR /app

# COPY ./users-service /app/

# RUN ["npm", "ci"]

# ENTRYPOINT [ "npm", "run", "start:dev" ]

FROM node AS builder

# Create app directory
WORKDIR /app

# Install app dependencies
COPY ./users-service/package.json            package.json
COPY ./users-service/package-lock.json       package-lock.json

RUN npm ci

# COPY ./users-service/.prettierrc.js          .prettierrc.js 
# COPY ./users-service/.eslintrc.js            .eslintrc.js
COPY ./users-service/tsconfig.json           tsconfig.json

COPY ./users-service/src                     src/
COPY ./users-service/tasks                   tasks/

RUN npm run build

FROM node:alpine

# Create app directory
WORKDIR /app

# Install app dependencies
COPY ./users-service/package.json            package.json
COPY ./users-service/package-lock.json       package-lock.json

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

CMD [ "node", "dist/main.js" ]
