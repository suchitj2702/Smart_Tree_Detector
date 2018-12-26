#!/bin/bash

# Install virtual environment 
virtualenv ENV
source ENV/bin/activate

# Install dependencies
pip install -r requirements.txt

# Deactivate Virtual Environment
deactivate
