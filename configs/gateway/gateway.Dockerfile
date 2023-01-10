FROM nginx:stable

# Install certbot requirements
RUN apt-get update && apt-get install certbot python3-certbot-nginx cron -y

# Delete the default config, as we do not want conflicts
RUN rm /etc/nginx/conf.d/default.conf

# Copy the script that will generate the https certificates once deployed
COPY ./configs/gateway/prepare-certbot.sh           /scripts/prepare-certbot.sh

# Mark the script as executable
RUN chmod +x /scripts/prepare-certbot.sh

# Copy the root nginx config
COPY ./configs/gateway/nginx.conf /etc/nginx/nginx.conf
# Copy custom nginx route configs
COPY ./configs/gateway/conf.d/container-map.conf    /etc/nginx/conf.d/1_container-map.conf
COPY ./configs/gateway/conf.d/default.conf          /etc/nginx/conf.d/marketplace.hotdeals.dev.conf

# Run Nginx
CMD ["/bin/sh", "-c", "exec nginx -g 'daemon off;';"]
