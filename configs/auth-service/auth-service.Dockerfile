# FROM node:alpine

# EXPOSE 8080

# WORKDIR /app

# COPY ./auth-service /app/

# RUN ["npm", "ci"]

# ENTRYPOINT [ "npm", "run", "start:dev" ]

FROM node AS builder

# Create app directory
WORKDIR /app

# Install app dependencies
COPY ./auth-service/package.json            package.json
COPY ./auth-service/package-lock.json       package-lock.json

RUN npm ci

# COPY ./auth-service/.prettierrc.js          .prettierrc.js 
# COPY ./auth-service/.eslintrc.js            .eslintrc.js
COPY ./auth-service/tsconfig.json           tsconfig.json

COPY ./auth-service/src                     src/
COPY ./auth-service/tasks                   tasks/

RUN npm run build

FROM node:alpine

# Create app directory
WORKDIR /app

# Install app dependencies
COPY ./auth-service/package.json            package.json
COPY ./auth-service/package-lock.json       package-lock.json

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

CMD [ "node", "dist/main.js" ]
