#!/bin/bash
set -e

# Install all the requirements
pip install -r requirements.txt

# Install gunicorn server
pip install gunicorn

# Wait for DB to start
# TODO: Find a better alternative 
sleep 2s

# Necessary Migrations
python manage.py db migrate
python manage.py db upgrade