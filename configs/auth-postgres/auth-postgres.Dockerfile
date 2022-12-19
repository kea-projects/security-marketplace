FROM postgres:alpine

ARG AUTH_POSTGRES_USER
ARG AUTH_POSTGRES_PASSWORD
ARG AUTH_POSTGRES_DATABASE

COPY ./configs/auth-postgres/docker-entrypoint-initdb.d/ /docker-entrypoint-initdb.d/

RUN sed  -i 's/AUTH_POSTGRES_USER/'$AUTH_POSTGRES_USER'/g' /docker-entrypoint-initdb.d/init.txt
RUN sed  -i 's/AUTH_POSTGRES_PASSWORD/'$AUTH_POSTGRES_PASSWORD'/g' /docker-entrypoint-initdb.d/init.txt
RUN sed  -i 's/AUTH_POSTGRES_DATABASE/'$AUTH_POSTGRES_DATABASE'/g' /docker-entrypoint-initdb.d/init.txt

