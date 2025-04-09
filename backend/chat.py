from ollama import chat
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio

from backend.jwt import config, security
from backend.pydantic_classes import Text
from backend.database import add_question_neiro, select_chat_nero, neiro_print
chat_ws = APIRouter()

@chat_ws.websocket("/ws")
async def ws(websocket: WebSocket):
    await websocket.accept()
    token = websocket._cookies.get(config.JWT_ACCESS_COOKIE_NAME)
    if token:
        id_human = security._decode_token(token).sub
    print("ws")
    try:
        while True:
            question = await websocket.receive_json()
            question = Text(**question).text
            add_question_neiro(id_human, question, "...")
            html = select_chat_nero(id_human)
            print(question)
            await websocket.send_text(f'''
                <div id="message">
                    {html}
                    <form ws-send>
                        <input name="text" placeholder="Введите запрос">
                        <button disabled><img src="/static/css/images/icons8-бумажный-самолетик-50.png" alt="" class="ws_dialog-button-image"></button>
                    </form>
                <div>
            ''')
            await asyncio.sleep(0.01)
            stream = chat(
                model='llama3.1:8b',
                messages=[{'role': 'user', 'content': f'''Отвечай на вопросы кратко и если вопрос не свзян с tele2, 
                                                      то отвечай ваш вопрос не связан с t2.Запомни логотип Tele2 черно белый.Вопрос: {question}'''}],
                stream=True,
            )
            full_response = ''
            for chunk in stream:
                print(full_response)
                full_response += chunk['message']['content']
                neiro_print(id_human, full_response)
                html = select_chat_nero(id_human)
                await websocket.send_text(f'''
                    <div id="message">
                        {html}
                        <form ws-send>
                            <input name="text" placeholder="Введите запрос">
                            <button disabled><img src="/static/css/images/icons8-бумажный-самолетик-50.png" alt="" class="ws_dialog-button-image"></button>
                        </form>
                    <div>
                ''')
                await asyncio.sleep(0.01)
            html = select_chat_nero(id_human)
            await websocket.send_text(f'''<div id="message">
                        {html}
                        <form ws-send>
                            <input name="text" placeholder="Введите запрос">
                            <button><img src="/static/css/images/icons8-бумажный-самолетик-50.png" alt="" class="ws_dialog-button-image"></button>
                        </form>
                    <div>''')
    except WebSocketDisconnect:
            print("Disconnect")