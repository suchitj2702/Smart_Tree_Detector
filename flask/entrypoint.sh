#!/bin/bash
set -e

pip install pipreqs

cd /app
pipreqs --force .
pip install -r requirements.txt

exec "$@"
