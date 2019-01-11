#!/bin/bash
set -e

# Update requirements.txt
pip install pipreqs
pipreqs --force .

# Install all the requirements
pip install -r requirements.txt

# Install gunicorn server
pip install gunicorn
