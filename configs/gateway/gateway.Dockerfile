FROM nginx:alpine

# Delete the default config, as we do not want conflicts
RUN rm /etc/nginx/conf.d/default.conf

# Copy the root nginx config
COPY ./configs/gateway/nginx.conf /etc/nginx/nginx.conf
# Copy custom nginx route configs
COPY ./configs/gateway/conf.d/default.conf        /etc/nginx/conf.d/default.conf
COPY ./configs/gateway/conf.d/container-map.conf  /etc/nginx/conf.d/container-map.conf

# Run Nginx
CMD ["/bin/sh", "-c", "exec nginx -g 'daemon off;';"]
