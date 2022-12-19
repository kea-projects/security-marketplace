FROM postgres

ARG LISTINGS_POSTGRES_USER
ARG LISTINGS_POSTGRES_PASSWORD
ARG LISTINGS_POSTGRES_DATABASE

ARG USERS_POSTGRES_USER
ARG USERS_POSTGRES_PASSWORD
ARG USERS_POSTGRES_DATABASE

COPY ./configs/main-postgres/docker-entrypoint-initdb.d/ /docker-entrypoint-initdb.d/

RUN sed  -i 's/LISTINGS_POSTGRES_USER/'$LISTINGS_POSTGRES_USER'/g' /docker-entrypoint-initdb.d/init.txt
RUN sed  -i 's/LISTINGS_POSTGRES_PASSWORD/'$LISTINGS_POSTGRES_PASSWORD'/g' /docker-entrypoint-initdb.d/init.txt
RUN sed  -i 's/LISTINGS_POSTGRES_DATABASE/'$LISTINGS_POSTGRES_DATABASE'/g' /docker-entrypoint-initdb.d/init.txt

RUN sed  -i 's/USERS_POSTGRES_USER/'$USERS_POSTGRES_USER'/g' /docker-entrypoint-initdb.d/init.txt
RUN sed  -i 's/USERS_POSTGRES_PASSWORD/'$USERS_POSTGRES_PASSWORD'/g' /docker-entrypoint-initdb.d/init.txt
RUN sed  -i 's/USERS_POSTGRES_DATABASE/'$USERS_POSTGRES_DATABASE'/g' /docker-entrypoint-initdb.d/init.txt

