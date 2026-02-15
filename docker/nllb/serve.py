"""Minimal NLLB-200 translation server. Replaces nllb-serve which is broken with modern transformers."""

import os
import platform
import sys

from flask import Flask, jsonify, request
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

MODEL_ID = os.environ.get("NLLB_MODEL", "facebook/nllb-200-distilled-600M")
PORT = int(os.environ.get("PORT", "6060"))
HOST = os.environ.get("HOST", "0.0.0.0")

print(f"Loading model {MODEL_ID} ...", flush=True)
tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_ID)
model.eval()
print(f"Model loaded. Python {platform.python_version()}, transformers {__import__('transformers').__version__}", flush=True)

app = Flask(__name__)


@app.post("/translate")
def translate():
    data = request.get_json(force=True)
    sources = data.get("source", [])
    src_lang = data.get("src_lang", "eng_Latn")
    tgt_lang = data.get("tgt_lang", "eng_Latn")

    if not sources:
        return jsonify({"translation": []})

    tokenizer.src_lang = src_lang
    inputs = tokenizer(sources, return_tensors="pt", padding=True, truncation=True, max_length=512)

    tgt_lang_id = tokenizer.convert_tokens_to_ids(tgt_lang)
    generated = model.generate(**inputs, forced_bos_token_id=tgt_lang_id, max_new_tokens=512)

    translations = tokenizer.batch_decode(generated, skip_special_tokens=True)
    return jsonify({"translation": translations})


if __name__ == "__main__":
    from gunicorn.app.base import BaseApplication

    class StandaloneApplication(BaseApplication):
        def __init__(self, app, options=None):
            self.options = options or {}
            self.application = app
            super().__init__()

        def load_config(self):
            for key, value in self.options.items():
                self.cfg.set(key, value)

        def load(self):
            return self.application

    # Single worker — model is not fork-safe and uses ~2GB RAM
    StandaloneApplication(app, {"bind": f"{HOST}:{PORT}", "workers": 1, "timeout": 120}).run()
