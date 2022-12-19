#!/bin/sh

# DOMAIN_NAME=$1 # "marketplace.hotdeals.dev"
# EMAIL=$2 # "whatever valid email"


if [ -z ${1+x} ]; then
    echo "[ERROR]: The parameter in slot '1' for 'DOMAIN_NAME' is unset!";
    exit 1;
    else DOMAIN_NAME=$1;
fi;
echo "[INFO]: Domain name is: $DOMAIN_NAME"

if [ -z ${2+x} ]; then
    echo "[ERROR]: The parameter in slot '2' for 'EMAIL' is unset!";
    exit 1;
    else EMAIL=$2;
fi;
echo "[INFO]: Email is: $EMAIL"

# Generate the tokens
echo "Generating tokens..."
certbot --nginx -d $DOMAIN_NAME --non-interactive --agree-tos -m $EMAIL


# Add cronjob for renewing certs - 30 days
echo "[INFO]: Creating cron job..."
echo "0 12 * * * /usr/bin/certbot renew --quiet" > mycron
crontab mycron

echo "[INFO]: Certbot script completed."
