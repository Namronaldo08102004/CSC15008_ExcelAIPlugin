from fastapi import APIRouter
from schemas.summarize_schema import SummarizationRequest, SummarizationResponse
from models.summarize import summarize_texts

summarize_router = APIRouter(prefix = "/summarize", tags = ["Summarization"])

@summarize_router.post("/")
def summarize(request: SummarizationRequest) -> SummarizationResponse:
    responses = summarize_texts(request.texts, request.format, request.model_name, request.temperature)
    return SummarizationResponse(responses = responses)