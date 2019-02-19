#!/bin/bash
set -e

# Install all the requirements
pip install -r requirements.txt

# Install gunicorn server
pip install gunicorn

# Run following command in container to generate version files
# python manage.py db migrate
#
# Run following command to upgrade:
# python manage.py db upgrade
