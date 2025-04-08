from pydantic import BaseModel

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