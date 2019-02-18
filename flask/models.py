from flask_sqlalchemy import SQLAlchemy
from geoalchemy2 import Geometry
import datetime

db = SQLAlchemy()

class BaseModel(db.Model):
    """Base data model for all objects"""
    __abstract__ = True

    def __init__(self, *args):
        super().__init__(*args)

    def __repr__(self):
        """Define a base way to print models"""
        return '%s(%s)' % (self.__class__.__name__, {
            column: value
            for column, value in self._to_dict().items()
        })

    def json(self):
        """
                Define a base way to jsonify models, dealing with datetime objects
        """
        return {
            column: value if not isinstance(value, datetime.date) else value.strftime('%Y-%m-%d')
            for column, value in self._to_dict().items()
        }

class User(BaseModel, db.Model):
    """Model for the users"""
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key = True)
    email = db.Column(db.String(32), unique=True, nullable=False)
    password = db.Column(db.String(32), nullable=False)

    def __init__(self, email=None, password=None):
        self.email = email
        self.password = password

class City(BaseModel, db.Model):
    """Model for the counting output of particular city"""
    __tablename__ = 'cities'

    id = db.Column(db.Integer, primary_key = True)
    label = db.Column(db.String(50))
    description = db.Column(db.String(130))
    user_id = db.Column(db.Integer, nullable=False)
    longitude = db.Column(db.Float)
    latitude = db.Column(db.Float)
    geo = db.Column(Geometry(geometry_type="POINT"))
    trees = db.Column(db.Integer)
    buildings = db.Column(db.Integer)

    def __init__(self, user_id, latitude, longitude, label, description='NA', no_of_trees=-1, no_of_buildings=-1):
        self.user_id = user_id
        self.latitude = latitude
        self.longitude = longitude
        self.label = label
        self.description = description
        self.geo = f'POINT({longitude} {latitude})'
        self.trees = no_of_trees
        self.buildings = no_of_buildings

    def update(self, latitude, longitude, no_of_trees, no_of_buildings):
        self.latitude = latitude
        self.longitude = longitude
        self.geo = f'POINT({longitude} {latitude})'
        self.trees = no_of_trees
        self.buildings = no_of_buildings