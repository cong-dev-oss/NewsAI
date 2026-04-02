import httpx
from app.core.config import settings
from .state_service import StateService

class AIService:
    @staticmethod
    def summarize(text: str) -> str:
        if not text:
            return ""
            
        system_prompt = (
            "Bạn là một biên tập viên báo chí chuyên nghiệp, khách quan và súc tích. "
            "Nhiệm vụ của bạn là đọc nội dung bài báo và tóm tắt lại. Bắt buộc tuân thủ 3 quy tắc: "
            "1. Trả lời trực tiếp vào nội dung tóm tắt, tuyệt đối không dùng các câu rào trước đón sau. "
            "2. Tóm tắt trong chính xác 3 câu ngắn gọn. "
            "3. Nếu bài gốc tiếng Anh, phải dịch và tóm tắt bằng Tiếng Việt chuẩn xác."
        )
        
        user_prompt = f"Nội dung bài báo:\n'''\n{text[:4000]}\n'''\n\nDựa vào nội dung trên, hãy viết tóm tắt:"
        
        url = f"{settings.OLLAMA_BASE_URL}/api/generate"
        
        payload = {
            "model": "qwen2.5:3b",
            "prompt": user_prompt,
            "system": system_prompt,
            "stream": False,
            "options": {
                "temperature": 0.3,
                "num_predict": 150
            },
            "keep_alive": 0 # Quan trọng giải phóng RAM
        }
        
        try:
            response = httpx.post(url, json=payload, timeout=60.0)
            if response.status_code == 200:
                return response.json().get("response", "").strip()
            else:
                print(f"Ollama error: {response.text}")
                return ""
        except Exception as e:
            print(f"Error calling AIService: {e}")
            return ""
