#!/bin/sh
set -eu

template="/etc/nginx/templates/default.conf.template"
target="/etc/nginx/conf.d/default.conf"

envsubst '${BACKEND_URL}' < "$template" > "$target"

echo '--- /etc/nginx/conf.d/default.conf'
cat "$target"

exec nginx -g 'daemon off;'
