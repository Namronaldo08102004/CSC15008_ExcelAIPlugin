from pydantic import BaseModel

class TranslationRequest(BaseModel):
    text: str
    source_lang: str
    target_lang: str
    model_name: str = "gemini-2.0-flash"
    temperature: float = 0.7

class TranslationResponse(BaseModel):
    original_text: str
    translated_text: str