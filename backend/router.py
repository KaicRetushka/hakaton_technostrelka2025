from fastapi import APIRouter, Response, Form, Request, Depends, UploadFile, File, HTTPException
from fastapi.responses import HTMLResponse
from typing import List

from backend.database import insert_user, check_user, check_admin
from backend.jwt import config, security
from backend.pydantic_classes import (BodyRegistration, ReturnAccessToken, BodyEnter, ReturnDetail)
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

@router.post("/metka",dependencies=[Depends(security.access_token_required)],
             tags=["Добавление метки админом"])
async def metka(request: Request, title: str = Form(...), coordinats: list = Form(...), description: str = Form(...),
                type: str = Form(...), photos: List[UploadFile] = File(None)):
    token = request.cookies.get(config.JWT_ACCESS_COOKIE_NAME)
    _id = security._decode_token(token)
    data = check_admin(_id)
    if not(data):
        return HTTPException(status_code=400, detail="Вы не являеетесь администратором")
    insert_metka(title, coordinats, description, type, photos)
    return {"detail": "Метка добавлена"}