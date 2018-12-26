import os, time
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_pymongo import PyMongo

# Config
UPLOAD_FOLDER = "uploads"
MAX_CONTENT_IN_MB = 16
MONGO_URI = "mongodb+srv://app:pass1234@freecluster-xhahv.mongodb.net/treeSeg?retryWrites=true"
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
app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_IN_MB * 1024 * 1024
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config["MONGO_URI"] = MONGO_URI
CORS(app)
mongo = PyMongo(app)

# API Routes

## Check Health
@app.route('/api/health')
def health():
    return jsonify(online=True)  

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
@app.route('/api/upload', methods=['POST'])
def upload():
    # check if the post request has the file part
    if 'file' not in request.files:
        return jsonify(success=False, error="The request doesn't include the required file part")
    file = request.files['file']
    # if user does not select file, browser also
    # submit an empty part without filename
    if file.filename == '':
        return jsonify(success=False, error="No file Selected")
    if file and allowedFile(file.filename):
        filename = renameAndKeepExtension(file.filename, str(int(time.time())))
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        # Start processing in another process
        return jsonify(success=True)

## ReactJS app serving
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
     path_dir = os.path.abspath("./react/build") # path to react build files
     if path != "" and os.path.exists(os.path.join(path_dir, path)):
         return send_from_directory(os.path.join(path_dir), path)
     else:
         return send_from_directory(os.path.join(path_dir),'index.html')

# MAIN
if __name__ == "__main__":
    app.run()