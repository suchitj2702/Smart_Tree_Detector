#!/bin/bash
set -e

# Install all the requirements
pip install -r requirements.txt

# Install gunicorn server
pip install gunicorn

# Necessary Migrations
python manage.py db migrate
python manage.py db upgrade