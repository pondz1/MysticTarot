#!/bin/sh
set -e

# Ensure data directory exists and has proper permissions for node user
mkdir -p /app/server/data
chown -R node:node /app/server/data 2>/dev/null || true

# If running as root, drop privileges to node user using su-exec
if [ "$(id -u)" = '0' ]; then
    exec su-exec node "$@"
fi

exec "$@"
