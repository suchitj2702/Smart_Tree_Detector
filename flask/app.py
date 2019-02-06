import os
import stat
import time
import logging
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from models import db, User

# Config

UPLOAD_FOLDER = "uploads"
MAX_CONTENT_IN_MB = 16
ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg', 'gif'])

# Helper Functions

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def rename_and_keep_extension(filename, newName):
    extension = filename.rsplit('.', 1)[1]
    return newName + "." + extension

def process_image(path):
    # process Image then store it on server
    pass

# Setup Flask App and PostgreSQL connector

app = Flask(__name__, static_folder=None)
app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_IN_MB * 1024 * 1024
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://docker:docker@database:5432/tree-seg'
CORS(app)
db.init_app(app)

# API Routes


## Check Health

@app.route('/api/health')
def health():
    return jsonify(online=True)  


## Sign Up User

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data["email"]
    password = data["password"]
    user = User.query.filter_by(email=email).first()
    if user != None:
        return jsonify(success=False, error="Email is registered")
    user = User(email=email, password=password)
    db.session.add(user)
    db.session.commit()
    return jsonify(success=True)


## Sign In User

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data["email"]
    password = data["password"]
    user = User.query.filter_by(email=email).first()
    if user == None:
        return jsonify(success=False, error="Email not registered")
    if user.password != password:
        return jsonify(success=False, error="Incorrect Password")
    return jsonify(success=True)


## Change Password

@app.route('/api/password', methods=['POST'])
def change_password():
    data = request.get_json()
    email = data["email"]
    old_password = data["old"]
    new_password = data["new"]
    user = User.query.filter_by(email=email, password=old_password).first()
    if user == None:
        return jsonify(success=False, error="Incorrect Password")
    user.password = new_password
    db.session.commit()
    return jsonify(success=True)


## Process and Post Data

@app.route('/api/process', methods=['POST'])
def process():
    data = request.get_json()
    db_doc = dict()
    db_doc["title"] = data["title"]
    db_doc["description"] = data["description"]
    db_doc["user"] = data["email"]
    seg_objs_selection = data["options"]
    image_name = data["image"]
    # processing
    app.logger.info("Processing begins ...")
    app.logger.info("Processing ends !")
    db_doc["coords"] = None # Output JSON
    db_doc["count"] = None
    mongo.db.geo.insert_one(db_doc)
    return jsonify(success=True)

## GET data
@app.route('/api/data', methods=['POST'])
def show():
    user = request.get_json()["email"]
    data = mongo.db.geo.find({'user': user}, {'_id': False, 'coords': False})
    return jsonify(data=data)
    

## Fetch list of uploads

@app.route('/api/list', methods=['POST'])
def list_uploads():
    data = request.get_json()
    email = data['email']
    list_of_uploads = mongo.db.uploads.find({ "user": email.lower()}, ["_id", "title"])
    return jsonify(data=list_of_uploads)


## Upload an image

@app.route('/api/upload', methods=['POST', 'DELETE'])
def upload():
    if request.method == 'POST':
        # check if the post request has the file part
        if 'filepond' not in request.files:
            return jsonify(success=False, error="The request doesn't include the required file part")
        file = request.files['filepond']
        # if user does not select file, browser also
        # submit an empty part without filename
        if file.filename == '':
            return jsonify(success=False, error="No file Selected")
        if file and allowed_file(file.filename):
            filename = rename_and_keep_extension(file.filename, str(int(time.time())))
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            os.chmod(filepath, stat.S_IRWXO)
            return filename
    elif request.method == 'DELETE':
        filename = request.get_data().decode('utf-8')
        path_dir = os.path.abspath("./")
        filepath = os.path.join(path_dir, app.config['UPLOAD_FOLDER'], filename)
        os.remove(filepath)
        return 'Done'


## ReactJS app serving

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    path_dir = os.path.abspath("./react") # path to react build files
    if path != "" and os.path.exists(os.path.join(path_dir, path)):
        filename = path
        relative_path = ""
        split_list = path.rsplit("/", 1)
        if len(split_list) > 1:
            filename = split_list[1]
            relative_path = split_list[0]
        return send_from_directory(os.path.join(path_dir, relative_path), filename)
    else:
        return send_from_directory(os.path.join(path_dir),'index.html')



# MAIN

if __name__ == "__main__":
    app.run()
else:
    gunicorn_logger = logging.getLogger('gunicorn.error')
    app.logger.handlers = gunicorn_logger.handlers
    app.logger.setLevel(gunicorn_logger.level)
