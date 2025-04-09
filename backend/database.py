import pymongo
import base64
from bson import ObjectId

client = pymongo.MongoClient() #host="150.241.72.55"
db = client["technostrelka_db"]

collection_users = db["collection_users"]
collection_metki = db["collection_metki"]
collection_chat_neiro = db["collection_chat_neiro"]
collection_metki_pokritie = db["collection_metki_pokritie"]
collection_pokritie = db["collection_pokritie"]

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

def select_metka_info(id):
    metka_info = collection_metki.find_one({"_id": ObjectId(id)})
    summa_star = 0
    for review in metka_info["review_arr"]:
        summa_star += review["stars"]
    if len(metka_info["review_arr"]) == 0:
        avg_star = 0
    else:
        avg_star = summa_star / len(metka_info["review_arr"])
    return {"id": str(metka_info["_id"]), "title": metka_info["title"], "x_coor": metka_info["x_coor"],
            "y_coor": metka_info["y_coor"], "description": metka_info["description"],
            "photos": metka_info["photos"], "review_arr": metka_info["review_arr"], "avg_star": avg_star}

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
                                                             "photos": photos_arr}})
    else:
        collection_metki.update_one({"_id": ObjectId(id)}, {"$set": {"title": title, "x_coor": x_coor,
                                                             "y_coor": y_coor, "description": description}})
    return True

def insert_review(id, message_text, stars, user_id):
    if not(collection_metki.find_one({"_id": ObjectId(id)})):
        return False
    user = collection_users.find_one({"_id": ObjectId(user_id)})
    fullname = user["surname"] + " " + user["name"]
    avatar_src = user["avatar_src"]
    collection_metki.update_one({"_id": ObjectId(id)},
                                {"$push": {"review_arr":
                                               {"message_text": message_text, "stars": stars, "fullname": fullname, "avatar_src": avatar_src}}})
    return True

def add_question_neiro(id_human, human_question, neiro_answer):
    collection_chat_neiro.insert_one({"id_human": ObjectId(id_human), "human_question": human_question,
                                      "neiro_answer": neiro_answer})

def select_chat_nero(id):
    html = "<div id='chat-container' style='overflow: auto; height: 78%; scrollbar-width: none; -ms-overflow-style: none; margin-top: 27px;'>"
    messages = collection_chat_neiro.find({"id_human": ObjectId(id)})
    for message in messages:
        html += f"<p class='human_question'>{message['human_question'] }</p><p class='neiro_answer'>{ message['neiro_answer']}</p>"
    html += f'''
    <script>
        console.log("aaaaaaaa")
        chatConteiner = document.getElementById('chat-container');
        chatConteiner.scrollTop = chatConteiner.scrollHeight;
    </script>'''
    html += "</div>"
    return html

def neiro_print(id_human, neiro_answer):
    message = collection_chat_neiro.find_one({"id_human": ObjectId(id_human)}, sort=[('_id', -1)])
    collection_chat_neiro.update_one({"_id": message["_id"]}, {"$set": {"neiro_answer": neiro_answer}})

def insert_metka_pokritie(id_human, text, stars, x_coor, y_coor):
    collection_metki_pokritie.insert_one({"id_human": ObjectId(id_human), "text": text, "stars": stars, "x_coor": x_coor,
                                          "y_coor": y_coor})

def delete_metka_pokritie_db(id_human, id):
    metka_pokritie = collection_metki_pokritie.find_one({"_id": ObjectId(id), "id_human": ObjectId(id_human)})
    if not(metka_pokritie):
        return False
    collection_metki

def select_metki_pokritie(id_human):
    metki_pokritie_arr = []
    metki_pokritie = collection_metki_pokritie.find()
    if id_human:
        for metka_pokritie in metki_pokritie:
            creator = collection_users.find_one({"_id": ObjectId(id_human)})
            is_my = False
            if str(creator["_id"]) == id_human:
                is_my = True
            creator = creator["surname"] + " " + creator["name"]
            metki_pokritie_arr.append({"id_metka_pokrtitie": str(metka_pokritie["_id"]), "cretor": creator,
                                       "x_coor": metka_pokritie["x_coor"], "y_coor": metka_pokritie["y_coor"],
                                       "is_my": is_my, "text": metka_pokritie["text"]})
    else:
        for metka_pokritie in metki_pokritie:
            creator = collection_users.find_one({"_id": metka_pokritie["id_human"]})
            is_my = False
            creator = creator["surname"] + " " + creator["name"]
            metki_pokritie_arr.append({"id_metka_pokrtitie": str(metka_pokritie["_id"]), "cretor": creator,
                                       "x_coor": metka_pokritie["x_coor"], "y_coor": metka_pokritie["y_coor"],
                                       "is_my": is_my,"text": metka_pokritie["text"]})
    return metki_pokritie_arr

def insert_pokritie(type, arr_coor):
    collection_pokritie.insert_one({"type": type, "arr_coor": arr_coor})

def delete_pokritie_db(id):
    collection_pokritie.delete_one({"_id": ObjectId(id)})

def select_all_pokritia():
    pokritia_arr = []
    pokritia = collection_pokritie.find()
    for pokritie in pokritia:
        pokritia_arr.append({"id": str(pokritie["_id"]), "type": pokritie["type"], "arr_coor": pokritie["arr_coor"]})
    return pokritia_arr

def select_all_pokritia_2g():
    pokritia_arr = []
    pokritia = collection_pokritie.find({"type": "2G"})
    for pokritie in pokritia:
        pokritia_arr.append({"id": str(pokritie["_id"]), "type": pokritie["type"], "arr_coor": pokritie["arr_coor"]})
    return pokritia_arr

def select_all_pokritia_3g():
    pokritia_arr = []
    pokritia = collection_pokritie.find({"type": "3G"})
    for pokritie in pokritia:
        pokritia_arr.append({"id": str(pokritie["_id"]), "type": pokritie["type"], "arr_coor": pokritie["arr_coor"]})
    return pokritia_arr

def select_all_pokritia_4g():
    pokritia_arr = []
    pokritia = collection_pokritie.find({"type": "4G"})
    for pokritie in pokritia:
        pokritia_arr.append({"id": str(pokritie["_id"]), "type": pokritie["type"], "arr_coor": pokritie["arr_coor"]})
    return pokritia_arr

def check_password(id, old_password):
    user = collection_users.find_one({"_id": ObjectId(id), "password": old_password})
    if user:
        return True
    return False

def update_password(id, old_password, new_password):
    data = check_password(id, old_password)
    if data:
        collection_users.update_one({"_id": ObjectId(id)}, {"$set": {"password": new_password}})
        return True
    return False