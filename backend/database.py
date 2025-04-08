import pymongo
import base64

client = pymongo.MongoClient()
db = client["technostrelka_db"]

collection_users = db["collection_users"]


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