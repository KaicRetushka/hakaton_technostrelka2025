from pydantic import BaseModel
from typing import List

class BodyRegistration(BaseModel):
    login: str
    password: str
    name: str
    surname: str

class ReturnAccessToken(BaseModel):
    access_token: str

class BodyEnter(BaseModel):
    login: str
    password: str

class ReturnDetail(BaseModel):
    detail: str

class IndexMetka(BaseModel):
    id: str
    title: str
    x_coor: float
    y_coor: float

class Text(BaseModel):
    text: str

class BodyMetkaPokritie(BaseModel):
    text: str
    stars: int
    x_coor: float
    y_coor: float

class DictMetkaPokrtitie(BaseModel):
    id_metka_pokrtitie: str
    cretor: str
    x_coor: float
    y_coor: float
    is_my: bool
    text: str

class AddBodyPokritie(BaseModel):
    type: str
    arr_coor: List[tuple[float, float]]