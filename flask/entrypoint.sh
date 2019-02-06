#!/bin/bash
set -e

cd /app
pip install -r requirements.txt

python manage.py db migrate
python manage.py db upgrade

export FLASK_ENV=development

exec "$@"
