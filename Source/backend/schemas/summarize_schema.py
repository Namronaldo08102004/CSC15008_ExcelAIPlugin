from pydantic import BaseModel
from typing import List

class SummarizationRequest(BaseModel):
    texts: List[str]
    format: str = "Item list"
    model_name: str = "gemini-2.0-flash"
    temperature: float = 0.7

class SummarizationResponse(BaseModel):
    responses: List[str]