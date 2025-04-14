from pydantic import BaseModel
from typing import List

class PromptRequest(BaseModel):
    prompts: List[str]
    model_name: str = "gemini-2.0-flash"
    temperature: float = 0.7

class PromptResponse(BaseModel):
    responses: List[str]