import os
import shutil
import stat
import time
import logging
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from geopy import distance
from models import db, User, City
import maskrcnninferencetemp as model_processor

# Config

UPLOAD_FOLDER = "uploads"
STATIC_FOLDER = "static"
OUTPUT_FOLDER = "output"
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
CORS(app, headers='Content-Type')
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


## Process

@app.route('/api/process', methods=['POST'])
def process():
    data = request.get_json()
    user = User.query.filter_by(email=data["email"]).first()
    if user == None:
        return jsonify(success=False, error="User not found")
    selection = 0
    if data["buildings"]:
        if data["trees"]:
            selection = 2
        else:
            selection = 1
    # Create dir for image set
    dirname = str(user.id) + '_' + str(int(time.time()))
    dirpath = os.path.join(UPLOAD_FOLDER, dirname)
    os.mkdir(dirpath, 0o777)
    for f in data['uploadImages']:
        os.rename(os.path.join(UPLOAD_FOLDER, f), os.path.join(dirpath, f))
    # processing
    app.logger.info("Processing begins ...")
    output_dir = os.path.join(STATIC_FOLDER, OUTPUT_FOLDER, dirname)
    os.mkdir(output_dir, 0o777)
    try:
        trees, buildings, latitude, longitude = model_processor.main(dirpath, selection, output_dir)
        shutil.rmtree(dirpath)
        app.logger.info("Processing ends !")
        return jsonify(success=True, trees=trees, buildings=buildings, imageSetId=dirname, latitude=latitude, longitude=longitude)
    except:
        shutil.rmtree(dirpath)
        shutil.rmtree(output_dir)
        return jsonify(success=False)


## Store Data

@app.route('/api/store', methods=['POST'])
def store():
    data = request.get_json()
    label = data["label"]
    description = data["description"]
    trees = data["trees"]
    buildings = data["buildings"]
    latitude = data["latitude"]
    longitude = data["longitude"]
    merge = data["merge"]
    user = User.query.filter_by(email=data["email"]).first()
    if user == None:
        return jsonify(success=False, error="User not found")
    new_city = City(user.id, latitude, longitude, label, description, trees, buildings)
    closest_city = None
    if merge:
        all_user_cities = City.query.filter_by(user_id=user.id).all()
        max_dist = 25 # in Km
        for city in all_user_cities:
            dist = distance.distance((city.latitude, city.longitude), (latitude, longitude)).kilometers
            if (dist < max_dist):
                max_dist = dist
                closest_city = city
    if closest_city is not None:
        closest_city.update(latitude, longitude, trees, buildings)
    else:
        db.session.add(new_city)
    db.session.commit()    
    return jsonify(success=True)


## Delete unused data

@app.route('/api/clean', methods=['POST'])
def clean():
    data = request.get_json()
    dirname = data["imageSetId"]
    dirpath = os.path.join(STATIC_FOLDER, OUTPUT_FOLDER, dirname)
    try:
        shutil.rmtree(dirpath)
        return jsonify(success=True)
    except:
        return jsonify(success=False)

## Fetch list of uploads
@app.route('/api/list', methods=['POST'])
def list_uploads():
    data = request.get_json()
    user = User.query.filter_by(email=data["email"]).first()
    if user == None:
        return jsonify(success=False, error="User not found")
    uploads = City.query.filter_by(user_id=user.id).all()
    data = list()
    for i in range(len(uploads)):
        upload = uploads[i]
        data.append({ "id": upload.id, "label": upload.label, "description": upload.description, "trees": upload.trees, "buildings": upload.buildings})
    return jsonify(data=data)


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


## Static File serving along with support for SPA

@app.route('/output/<string:image_set_id>/<string:image_file>')
def serve_output(image_set_id, image_file):
    path_dir = os.path.abspath(STATIC_FOLDER)
    dirpath = os.path.join(path_dir, OUTPUT_FOLDER, image_set_id)
    print(dirpath)
    return send_from_directory(dirpath, image_file)

@app.route('/', defaults={'path': ''})
@app.route('/<path:file_path>')
def serve(file_path):
    path_dir = os.path.abspath(STATIC_FOLDER) # path to all static files that can be served
    if file_path != "" and os.path.exists(os.path.join(path_dir, file_path)):
        filename = file_path
        relative_path = ""
        split_list = file_path.rsplit("/", 1)
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
