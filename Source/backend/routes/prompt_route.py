from fastapi import APIRouter
from schemas.prompt_schema import PromptRequest, PromptResponse
from models.prompt import handle_prompts

prompt_router = APIRouter(prefix = "/prompt", tags = ["Prompting"])

@prompt_router.post("/")
def prompt(request: PromptRequest) -> PromptResponse:
    responses = handle_prompts(request.prompts, request.model_name, request.temperature)
    return PromptResponse(responses = responses)