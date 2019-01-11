#!/bin/bash
set -e

cd /app
npm install

exec "$@"
