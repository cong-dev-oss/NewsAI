from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.core.config import settings
import asyncio
import redis.asyncio as redis
import os
import json

router = APIRouter()

async def redis_listener(websocket: WebSocket):
    r = redis.Redis(host=settings.REDIS_HOST, port=int(settings.REDIS_PORT), db=0)
    pubsub = r.pubsub()
    await pubsub.subscribe("task_progress")
    
    try:
        while True:
            message = await pubsub.get_message(ignore_subscribe_messages=True)
            if message:
                data = message['data'].decode('utf-8')
                await websocket.send_text(data)
            await asyncio.sleep(0.1)
    except Exception as e:
        print(f"WS Redis Listener Error: {e}")
    finally:
        await pubsub.unsubscribe("task_progress")

@router.websocket("/ws/progress")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        # Chạy listener ngầm để chuyển hướng tin nhắn từ Redis sang WebSocket
        listener_task = asyncio.create_task(redis_listener(websocket))
        while True:
            # Giữ kết nối mở, có thể nhận heartbeats nếu cần
            data = await websocket.receive_text()
            # Heartbeat check if needed
            
    except WebSocketDisconnect:
        print("WS Client disconnected")
    except Exception as e:
        print(f"WS Error: {e}")
    finally:
        # Dọn dẹp task ngầm
        if 'listener_task' in locals():
            listener_task.cancel()
