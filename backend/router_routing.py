from fastapi import APIRouter, Request
from fastapi.templating import Jinja2Templates

templates = Jinja2Templates(directory="frontend/templates")

router_routing = APIRouter()

@router_routing.get("/reg",
                    tags=["Получение страницы регистрации"])
async def give_lead_str(request: Request):
    return templates.TemplateResponse("reg.html", {"request": request})

@router_routing.get("/vhod", tags=["Получение страницы входа"])
async def give_lead_str(request: Request):
    return templates.TemplateResponse("vhod.html", {"request": request})