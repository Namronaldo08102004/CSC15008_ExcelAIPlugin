import sys
import io
import logging
from logging.handlers import RotatingFileHandler
from config.logging_config import LoggingConfig

class Logger:
    def __init__ (self, name = "", log_level = logging.INFO, log_file = None) -> None:
        self.log = logging.getLogger(name)
        self.get_logger(log_level, log_file)
    
    def get_logger(self, log_level, log_file):
        self.log.setLevel(log_level)
        self._init_formatter()
        if log_file is not None:
            self._add_file_hander(LoggingConfig.LOG_DIR / log_file)
        else:
            self._add_stream_hander()
    
    def _init_formatter(self):
        self.formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
        
    def _add_stream_hander(self):
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding = "utf-8")
        stream_handler = logging.StreamHandler(sys.stdout)
        stream_handler.setFormatter(self.formatter)
        self.log.addHandler(stream_handler)

    def _add_file_hander(self, log_file):
        file_handler = RotatingFileHandler(log_file, maxBytes = 1000000, backupCount = 10, encoding = "utf-8")
        file_handler.setFormatter(self.formatter)
        self.log.addHandler(file_handler)

    def log_model(self, model_name, temperature):
        self.log.info(f"Model name: {model_name}, temperature: {temperature}")

    def log_translate_response(self, original_text, original_lang, translated_text, translated_lang):
        self.log.info(f"Original text ({original_lang}): {original_text} --> Translated text ({translated_lang}): {translated_text}")
        
    def log_handle_prompts(self, prompts, responses):
        self.log.info(f"Prompts: {prompts} --> Responses: {responses}")
        
    def log_summarization(self, texts, format, responses):
        self.log.info(f"Summarize in the \"{format}\" format: Prompts {texts} --> Responses: {responses}")