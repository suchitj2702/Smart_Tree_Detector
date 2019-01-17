import os, stat, time
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_pymongo import PyMongo

# Config
UPLOAD_FOLDER = "uploads"
MAX_CONTENT_IN_MB = 16
ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg', 'gif'])

# Helper Functions
def allowedFile(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def renameAndKeepExtension(filename, newName):
    extension = filename.rsplit('.', 1)[1]
    return newName + "." + extension

def processImage(path):
    # process Image then store it on server
    pass

# Setup Flask App and PyMongo
app = Flask(__name__, static_folder=None)
app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_IN_MB * 1024 * 1024
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MONGO_URI"] = "mongodb://mongo:27017/tree-seg"
CORS(app)
mongo = PyMongo(app)

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
    user = mongo.db.users.find_one({"email": email})
    if user != None:
        return jsonify(success=False, error="Email is registered")
    mongo.db.users.insert_one({"email": email, "password": password})
    return jsonify(success=True)

## Sign In User
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data["email"]
    password = data["password"]
    user = mongo.db.users.find_one({"email": email})
    if user == None:
        return jsonify(success=False, error="Email not registered")
    if user["password"] != password:
        return jsonify(success=False, error="Incorrect Password")
    return jsonify(success=True)

## Change Password
@app.route('/api/password', methods=['POST'])
def changePassword():
    data = request.get_json()
    email = data["email"]
    oldPassword = data["old"]
    newPassword = data["new"]
    user = mongo.db.users.find_one_and_update({'email': email, 'password': oldPassword}, {'$set': {'password': newPassword}})
    if user == None:
        return jsonify(success=False, error="Incorrect Password")
    return jsonify(success=True)

## Fetch list of uploads
@app.route('/api/list', methods=['POST'])
def listUploads():
    data = request.get_json()
    email = data['email']
    listOfUploads = mongo.db.uploads.find({ "user": email.lower()}, ["_id", "title"])
    return jsonify(data=listOfUploads)

## Fetch a particular upload
@app.route('/api/fetch', methods=['POST'])
def fetchUpload():
    data = request.get_json()
    uploadId = data['upload']
    uploadData = mongo.db.uploads.find({ "_id": uploadId})
    return jsonify(data=uploadData)

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
        if file and allowedFile(file.filename):
            filename = renameAndKeepExtension(file.filename, str(int(time.time())))
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            os.chmod(filepath, stat.S_IRWXO)
            return filename
    elif request.method == 'DELETE':
        filename = request.get_data().decode('utf-8')
        path_dir = path_dir = os.path.abspath("./")
        filepath = os.path.join(path_dir, app.config['UPLOAD_FOLDER'], filename)
        app.logger.info(filepath)
        os.remove(filepath)
        return 'Done'

## ReactJS app serving
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    path_dir = os.path.abspath("./react") # path to react build files
    if path != "" and os.path.exists(os.path.join(path_dir, path)):
        filename = path
        relativePath = ""
        splitList = path.rsplit("/", 1)
        if len(splitList) > 1:
            filename = splitList[1]
            relativePath = splitList[0]
        return send_from_directory(os.path.join(path_dir, relativePath), filename)
    else:
        return send_from_directory(os.path.join(path_dir),'index.html')

# MAIN
if __name__ == "__main__":
    app.run()
