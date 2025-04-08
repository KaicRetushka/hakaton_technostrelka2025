import pymongo
import base64
from bson import ObjectId

client = pymongo.MongoClient()
db = client["technostrelka_db"]

collection_users = db["collection_users"]
collection_metki = db["collection_metki"]

def insert_user(login, password, name, surname):
    if collection_users.count_documents({"login": login}) > 0:
        return False
    with open("base.jpg", "rb") as file:
        avatar_src = file.read()
    avatar_src = base64.b64encode(avatar_src).decode("utf8")
    result = collection_users.insert_one({"login": login, "password": password, "name": name, "surname": surname,
                                          "avatar_src": avatar_src, "role": "user", "is_ban": False})
    return {"id": result.inserted_id}

def check_user(login, password):
    user = collection_users.find_one({"login": login, "password": password})
    if user:
        if user["is_ban"]:
            return {"is_ban": True}
        return {"id": user["_id"], "is_ban": False}
    return False

def add_admin():
    if not(collection_users.find_one({"role": "admin"})):
        with open("base.jpg", "rb") as file:
            avatar_src = file.read()
        avatar_src = base64.b64encode(avatar_src).decode("utf8")
        collection_users.insert_one({"login": "admin", "password": "admin", "name": "Админ", "surname": "Админ",
                                     "avatar_src": avatar_src, "role": "admin", "is_ban": False})

def check_admin(_id):
    user = collection_users.find_one({"_id", ObjectId(_id)})
    if user["role"] == "admin":
        return True
    return False

def insert_metka(title, coordinats, description, type, photos):

