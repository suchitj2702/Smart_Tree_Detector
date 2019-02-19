#!/bin/bash
set -e

# Wait for DB to start
# TODO: Find a better alternative 
sleep 2s

cd /app
python manage.py db upgrade || echo "Nothing to upgrade in Database"

gunicorn --bind 0.0.0.0:5000 --log-level=info --timeout=900 wsgi:app
