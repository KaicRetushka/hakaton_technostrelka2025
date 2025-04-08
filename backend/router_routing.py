from fastapi import APIRouter, Request, Depends
from fastapi.templating import Jinja2Templates

from backend.database import check_admin, select_metka_info, select_user_all
from backend.jwt import security, config

templates = Jinja2Templates(directory="frontend/templates")

router_routing = APIRouter()

@router_routing.get("/", tags=["""Получение главной страницы, is_reg, is_admin, fullname."""])
async def give_index(request: Request):
    token = request.cookies.get(config.JWT_ACCESS_COOKIE_NAME)
    is_reg = False
    is_admin = False
    fullname = None
    if token:
        is_reg = True
        user_info = select_user_all(security._decode_token(token).sub)
        fullname = user_info["name"] + " " + user_info["surname"]
        is_admin = check_admin(security._decode_token(token).sub)
    return templates.TemplateResponse("index.html", {"request": request, "is_reg": is_reg, "is_admin": is_admin,
                                                     "fullname": fullname})

@router_routing.get("/reg",
                    tags=["Получение страницы регистрации"])
async def give_lead_str(request: Request):
    return templates.TemplateResponse("reg.html", {"request": request})

@router_routing.get("/vhod", tags=["Получение страницы входа"])
async def give_lead_str(request: Request):
    return templates.TemplateResponse("vhod.html", {"request": request})

@router_routing.get("/metka/{id}", tags=["Получение всей информации о метке metka_info{id, title, x_coor, y_coor, description, photos, review_arr, avg_star}"])
async def get_metka_id(request: Request, id: str):
    try:
        token = request.cookies.get(config.JWT_ACCESS_COOKIE_NAME)
        is_admin = check_admin(security._decode_token(token).sub)
    except:
        is_admin = False
    metka_info = select_metka_info(id)

    return templates.TemplateResponse("metka_info.html", {"request": request, "is_admin": is_admin,
                                                     "metka_info": metka_info})

@router_routing.get("/edit_profile", dependencies=[Depends(security.access_token_required)],
                    tags=["Получение страницы изменения информации о пользователе. Этот запрос содержит объект user_info = {login, password, name, surname, avatar_src}"])
async def give_edit_profile_str(request: Request):
    token = request.cookies.get(config.JWT_ACCESS_COOKIE_NAME)
    user_info = select_user_all(security._decode_token(token).sub)
    return templates.TemplateResponse("edit_profile.html", {"request": request, "user_info": user_info})