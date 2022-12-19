# FROM node:alpine

# EXPOSE 8081

# WORKDIR /app

# COPY ./listings-service /app/

# RUN ["npm", "ci"]

# ENTRYPOINT [ "npm", "run", "start:dev" ]

FROM node AS builder

# Create app directory
WORKDIR /app

# Install app dependencies
COPY ./listings-service/package.json            package.json
COPY ./listings-service/package-lock.json       package-lock.json

RUN npm ci

# COPY ./listings-service/.prettierrc.js          .prettierrc.js 
# COPY ./listings-service/.eslintrc.js            .eslintrc.js
COPY ./listings-service/tsconfig.json           tsconfig.json

COPY ./listings-service/src                     src/
COPY ./listings-service/tasks                   tasks/

RUN npm run build

FROM node:alpine

# Create app directory
WORKDIR /app

# Install app dependencies
COPY ./listings-service/package.json            package.json
COPY ./listings-service/package-lock.json       package-lock.json

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

CMD [ "node", "dist/main.js" ]
