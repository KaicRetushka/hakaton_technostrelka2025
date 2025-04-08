from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from authx.exceptions import MissingTokenError, JWTDecodeError
import uvicorn

from backend.router import router
from backend.router_routing import router_routing
from backend.database import add_admin
from pydantic import BaseModel
# from transformers import pipeline

# Создаем экземпляр FastAPI
app = FastAPI()

# Загружаем модель для генерации ответов
# chatbot = pipeline("conversational", model="microsoft/DialoGPT-medium")


# Определяем модель для входящих данных
# class Message(BaseModel):
#     message: str
#
#
# @app.post("/chat")
# async def chat(msg: Message):
#     # Генерируем ответ от бота
#     response = chatbot(msg.message)
#     bot_reply = response[0]['generated_text']
#     return {"reply": bot_reply}

app.mount("/static", StaticFiles(directory="frontend/static"), name="static")

app.include_router(router)
app.include_router(router_routing)

@app.exception_handler(MissingTokenError)
async def missing_token_error(request, exc):
    raise HTTPException(status_code=403, detail="Вы не зарегистрированы")

@app.exception_handler(JWTDecodeError)
async def jwt_decode_error(request, exc):
    raise HTTPException(status_code=401, detail="Токен истёк или недействителен")


if __name__ == "__main__":
    add_admin()
    uvicorn.run("main:app", reload=True)