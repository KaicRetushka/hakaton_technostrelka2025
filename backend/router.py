from fastapi import APIRouter, Response, Form, Request, Depends, UploadFile, File, HTTPException, Query
from fastapi.responses import HTMLResponse
from typing import List
import base64

from backend.database import (insert_user, check_user, check_admin, insert_metka, select_metki_for_index, update_login,
                              update_name, update_surname, update_photo, delete_metka_db, update_metka, insert_review)
from backend.jwt import config, security
from backend.pydantic_classes import (BodyRegistration, ReturnAccessToken, BodyEnter, ReturnDetail, IndexMetka)
from backend.router_routing import router_routing

router = APIRouter()

@router.post("/registration", tags=["Регистрация"])
async def registration(response: Response, body: BodyRegistration = Form(...)):
    data = insert_user(body.login, body.password, body.name, body.surname)
    if data:
        token = security.create_access_token(uid=str(data["id"]))
        response.set_cookie(config.JWT_ACCESS_COOKIE_NAME, token)
        response.headers["hx-redirect"] = "/"
        return {"token": token}
    return HTMLResponse("<script>alert('Такой логин уже занят')</script>")

@router.post("/enter", tags=["Вход"])
async def enter(response: Response, body: BodyEnter = Form(...)) -> ReturnAccessToken:
    data = check_user(body.login, body.password)
    if data:
        if data["is_ban"]:
            response.headers["hx-redirect"] = "/ban"
            return {"access_token": "no"}
        token = security.create_access_token(uid=str(data["id"]))
        response.set_cookie(config.JWT_ACCESS_COOKIE_NAME, token)
        response.headers["hx-redirect"] = "/"
        return {"access_token": token}
    return HTMLResponse("<script>alert('Неверный логин или пароль')</script>")

@router.delete("/exit", tags=["Выход из аккаунта"])
async def exit(response: Response) -> ReturnDetail:
    response.delete_cookie(config.JWT_ACCESS_COOKIE_NAME)
    return {"detail": "Вы вышли из аккаунта"}

@router.post("/metka", dependencies=[Depends(security.access_token_required)],
             tags=["Добавление метки админом"])
async def metka(request: Request, title: str = Query(...), x_coor: float = Query(...), y_coor: float = Query(...),
                description: str = Query(""), photos: List[UploadFile] = File(None)):
    token = request.cookies.get(config.JWT_ACCESS_COOKIE_NAME)
    data = check_admin(security._decode_token(token).sub)
    if not(data):
        return HTTPException(status_code=400, detail="Вы не являеетесь администратором")
    photos_arr = []
    if photos:
        for photo in photos:
            photos_arr.append(base64.b64encode(await photo.read()).decode("utf8"))
    print(photos_arr)
    insert_metka(title, x_coor, y_coor,  description, photos_arr)
    return {"detail": "Метка добавлена"}

@router.get("/metki", tags=["Получение всех меток на главную страницу"])
async def get_metki() -> List[IndexMetka]:
    metki_arr = select_metki_for_index()
    return metki_arr

@router.post("/user/login_name_surname_avatar", dependencies=[Depends(security.access_token_required)],
             tags=["Изменение логина, имени, фамилию и аватарки"])
async def login_name_surname(request: Request, login: str = Form(...), name: str = Form(...), surname: str = Form(...),
                             avatar: UploadFile = File(None)) -> ReturnDetail:
    token = request.cookies.get(config.JWT_ACCESS_COOKIE_NAME)
    data_login = update_login(security._decode_token(token).sub, login)
    if not(data_login):
        raise HTTPException(status_code=409, detail="Такой логин уже занят")
    update_name(security._decode_token(token).sub, name)
    update_surname(security._decode_token(token).sub, surname)
    if avatar:
        avatar_src = await avatar.read()
        update_photo(security._decode_token(token).sub, avatar_src)
    return {"detail": "Информация о пользователе изменена"}

@router.delete("/metka/{id}", dependencies=[Depends(security.access_token_required)], tags=["Удаление метки"])
async def delete_metka(response: Response, id: str, request: Request):
    token = request.cookies.get(config.JWT_ACCESS_COOKIE_NAME)
    data = check_admin(security._decode_token(token).sub)
    if not(data):
        return HTTPException(status_code=400, detail="Вы не являеетесь администратором")
    delete_metka_db(id)
    response.headers["hx-redirect"] = "/"
    return {"detail": "Метка удалена"}

@router.put("/metka/{id}", dependencies=[Depends(security.access_token_required)], tags=["Изменение метки"])
async def put_metka(request: Request, id: str, title: str = Query(...), x_coor: float = Query(...), y_coor: float = Query(...),
                description: str = Query(""), photos: List[UploadFile] = File(None)):
    token = request.cookies.get(config.JWT_ACCESS_COOKIE_NAME)
    data = check_admin(security._decode_token(token).sub)
    if not(data):
        return HTTPException(status_code=400, detail="Вы не являеетесь администратором")
    if photos:
        photos_arr = []
        for photo in photos:
            photos_arr.append(base64.b64encode(await photo.read()).decode("utf8"))
    else:
        photos_arr = None
    data = update_metka(id, title, x_coor, y_coor, description, photos_arr)
    if data:
        return {"detail": "Метка изменена"}
    raise HTTPException(status_code=400, detail="Неверный id метки")

@router.post("/metka/{id}/review", dependencies=[Depends(security.access_token_required)],
             tags=["Добавление отзыва к маршруту"])
async def post_review(request: Request, id: str, message_text = Form(...), stars: int = Form(...)):
    token = request.cookies.get(config.JWT_ACCESS_COOKIE_NAME)
    data = insert_review(id, message_text, stars, security._decode_token(token).sub)
    if data:
        return {"detail": "Отзыв добавлен"}
    raise HTTPException(status_code=400, detail="Неверный id маршрута")
