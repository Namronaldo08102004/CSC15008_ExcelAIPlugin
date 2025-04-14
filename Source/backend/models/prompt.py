from utils.logger import Logger
import google.generativeai as genai
import re
from typing import List

LOGGER = Logger(__file__, log_file = "prompt.log")

def clean(text: str):
    patterns = {
        r"\s+": " ",  # replace multiple spaces with a single space
        r"\"": "'",  # replace double quotes with single quotes to avoid JSON parsing error
    }
    text = text.strip()
    for pattern, repl in patterns.items():
        text = re.sub(pattern, repl, text)
    return text

def handle_prompts (prompts: List[str], model_name: str = "gemini-2.0-flash", temperature: float = 0.7) -> List[str]:
    prompts = ['\n'.join([para for para in prompt.split('\r') if para != ""]) for prompt in prompts]
    requests = "\n".join([f"- Request {i + 1}: {prompts[i]}" for i in range (len(prompts))])
    answer_formats = "\n".join(f"Answer {i + 1}: (Your answer for the request {i + 1})" for i in range (len(prompts)))

    gemini_prompt = f"""
    You are an intelligent AI capable of fulfilling all user requests.
    I will provide you with the user's requests, and your task is to respond to them in the most reasonable and accurate manner possible.

    Here is the list of requests provided by the user:
    {requests}

    The only reminder I have for you is: when answering the user's requests, you are only allowed to respond within the scope of the user's requests, and must not provide any additional information unless explicitly asked for by the user.

    Your response must strictly follow the format below:
    ---
    {answer_formats}
    ---
    """
    
    model = genai.GenerativeModel(model_name)
    
    response = model.generate_content(gemini_prompt, generation_config = {"temperature": temperature})
    response = response.text
    
    numPrompts = 0
    lines = response.split("\n")
    index = 0
    responses: List[str] = []
    
    while (index < len(lines)):
        if lines[index].startswith(f"Answer {numPrompts + 1}:"):
            heading = f"Answer {numPrompts + 1}:"
            answer = clean(lines[index][len(heading) : ])
            index += 1
            numPrompts += 1
            
            stopSign = False
            while (index < len(lines) and not lines[index].startswith(f"Answer {numPrompts + 1}:")):
                if (lines[index] == "---"):
                    stopSign = True
                    break
                answer += ('\n' if lines[index] != "" else "") + clean(lines[index])
                index += 1
            
            responses.append(answer.strip('\n'))
            if (stopSign):
                break
        else:
            index += 1
            
    LOGGER.log_model(model_name, temperature)
    try:
        LOGGER.log_handle_prompts(prompts, responses)
    except Exception as e:
        print(f"❌ ERROR in logging response: {e}")
    
    return responses