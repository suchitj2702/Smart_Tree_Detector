#!/bin/bash
set -e

cd /app
pip install -r requirements.txt

# Wait for DB to start
# TODO: Find a better alternative 
sleep 2s

python manage.py db upgrade

export FLASK_ENV=development

exec "$@"
