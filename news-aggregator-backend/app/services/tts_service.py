import httpx
from typing import Optional
import time

from app.core.config import settings

class TTSService: 
    
    @staticmethod
    def generate_audio(text: str) -> Optional[str]:
        """
        Gọi API sang dự án void-box để tạo audio từ nội dung tóm tắt.
        Trả về URL của file audio hoặc None nếu lỗi.
        """
        if not text:
            return None
            
        payload = {
            "text": text,
            "language": "vi" # Giả định cấu hình tiếng việt
        }
        
        timeout = httpx.Timeout(
            connect=10.0,
            write=10.0,
            read=60.0,  # Thời gian chờ sinh audio
            pool=10.0,
        )

        try:
            # Hãy cập nhật chính xác endpoint của Void-box nếu khác với VOID_BOX_URL.
            # Rất nhiều tool sinh file lưu tại local và trả về filename. Server Backend
            # của bạn có thể cần lưu lại URL hoàn chỉnh để NextJS truy cập được.
            response = httpx.post(settings.VOID_BOX_URL, json=payload, timeout=timeout)
            
            if response.status_code == 200:
                data = response.json()
                # Giả sử void-box trả về {"audio_url": "http://192.168.119.128:8000/static/audio_xx.mp3"}
                return data.get("audio_url") or data.get("url")
            else:
                print(f"Void-box TTS error: {response.text}")
                return None
        except Exception as e:
            print(f"Void-box connection error: {e}")
            return None
