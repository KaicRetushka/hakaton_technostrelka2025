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
    user = collection_users.find_one({"_id": ObjectId(_id)})
    if user["role"] == "admin":
        return True
    return False

def insert_metka(title, x_coor, y_coor,  description, photos_arr):
    collection_metki.insert_one({"title": title, "x_coor": x_coor, "y_coor": y_coor,
                                 "description": description, "photos": photos_arr, "review_arr": []})

def select_metki_for_index():
    metki_arr = []
    metki = collection_metki.find()
    for metka in metki:
        metki_arr.append({"id": str(metka["_id"]), "title": metka["title"],
                          "x_coor": metka["x_coor"], "y_coor": metka["y_coor"]})
    return metki_arr

# def select_metka_info(id):
#     metka_info = collection_metki.find_one({"_id": ObjectId(id)})
#     # for review_arr
#     return {"_id": str(metka_info["id"]), "title": metka_info["title"], "x_coor": metka_info["x_coor"],
#             "y_coor": metka_info["y_coor"], "description": metka_info["description"],
#             "photos_arr": metka_info["photos_arr"], "avg_star": }

def select_user_all(id):
    data = collection_users.find_one({"_id": ObjectId(id)}, {"_id": 0})
    return data

def update_photo(id, avatar_src):
    avatar_src = base64.b64encode(avatar_src).decode("utf8")
    collection_users.update_one({"_id": ObjectId(id)}, {"$set": {"avatar_src": avatar_src}})

def update_name(id, name):
    collection_users.update_one({"_id": ObjectId(id)}, {"$set": {"name": name}})


def update_surname(id, surname):
    collection_users.update_one({"_id": ObjectId(id)}, {"$set": {"surname": surname}})

def update_login(id, login):
    user = collection_users.find_one({"login": login, "_id": {"$ne": ObjectId(id)}})
    if user:
        return False
    collection_users.update_one({"_id": ObjectId(id)}, {"$set": {"login": login}})
    return True

def delete_metka_db(id):
    collection_metki.delete_one({"_id": ObjectId(id)})

def update_metka(id, title, x_coor, y_coor, description, photos_arr):
    if not(collection_metki.find_one({"_id": ObjectId(id)})):
        return False
    if photos_arr:
        collection_metki.update_one({"_id": ObjectId(id)}, {"$set": {"title": title, "x_coor": x_coor,
                                                             "y_coor": y_coor, "description": description,
                                                             "photos_arr": photos_arr}})
    else:
        collection_metki.update_one({"_id": ObjectId(id)}, {"$set": {"title": title, "x_coor": x_coor,
                                                             "y_coor": y_coor, "description": description}})
    return True

def insert_review(id, message_text, stars, user_id):
    if not(collection_metki.find_one({"_id": ObjectId(id)})):
        return False
    collection_metki.update_one({"_id": ObjectId(id)},
                                {"$push": {"review_arr":
                                               {"message_text": message_text, "stars": stars, "user_id": user_id}}})
    return True