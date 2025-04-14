from utils.logger import Logger
import google.generativeai as genai
import re
from typing import List

LOGGER = Logger(__file__, log_file = "summarize.log")

def clean(text: str):
    patterns = {
        r"\s+": " ",  # replace multiple spaces with a single space
        r"\"": "'",  # replace double quotes with single quotes to avoid JSON parsing error
    }
    text = text.strip()
    for pattern, repl in patterns.items():
        text = re.sub(pattern, repl, text)
    return text

def summarize_texts (texts: List[str], format: str = "Item list", model_name = "gemini-2.0-flash", temperature = 0.7) -> List[str]:
    texts = ['\n'.join([para for para in text.split('\r') if para != ""]) for text in texts]
    requests = "\n".join([f"- Request {i + 1}: {texts[i]}" for i in range (len(texts))])
    answer_formats = "\n".join(f"Answer {i + 1}: (Your summarization for the request {i + 1})" for i in range (len(texts)))
    
    prompt = f"""
    You are an expert in summarizing content provided by the user.
    I will give you a list of summarization requests from the user. Your task is to summarize the content according to the format specified by the user and in the same language as the content provided.

    Below is the list of summarization requests:
    {requests}

    The user requires the summaries to follow this format: {format}.

    The only important reminder is: you are only allowed to summarize within the scope of the content provided by the user, and must not add any external information unless the user explicitly requests it.

    Your response must strictly follow the structure below:
    ---
    {answer_formats}
    ---
    """
    
    model = genai.GenerativeModel(model_name)
    
    response = model.generate_content(prompt, generation_config = {"temperature": temperature})
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
                answer += '\n' + clean(lines[index])
                index += 1
            
            responses.append(answer.strip('\n'))
            if (stopSign):
                break
        else:
            index += 1
    
    LOGGER.log_model(model_name, temperature)
    try:
        LOGGER.log_summarization(texts, format, responses)
    except Exception as e:
        print(f"❌ ERROR in logging response: {e}")
    
    return responses