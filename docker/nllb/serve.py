"""NLLB-200 translation server using CTranslate2 for fast CPU inference.

CTranslate2 is 3-5x faster than PyTorch for transformer models on CPU.
Uses INT8 quantization for an additional ~2x speedup with minimal quality loss.
Model is converted from HuggingFace format on first boot and cached on disk.

Binds to [::] (IPv6 dual-stack) so both IPv4 health checks and Fly's IPv6
internal networking (.internal DNS) work.
"""

import json
import os
import shutil
import socket
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

import ctranslate2
from transformers import AutoTokenizer

MODEL_ID = os.environ.get("NLLB_MODEL", "facebook/nllb-200-distilled-600M")
CT2_MODEL_DIR = os.environ.get("CT2_MODEL_DIR", "/models/ct2-nllb-600M-int8")
PORT = int(os.environ.get("PORT", "6060"))
HOST = os.environ.get("HOST", "::")
API_KEY = os.environ.get("NLLB_API_KEY", "")
INTRA_THREADS = int(os.environ.get("CT2_INTRA_THREADS", "2"))

# Convert HuggingFace model to CTranslate2 INT8 format on first boot.
# A .done sentinel marks successful conversion — partial model.bin from
# a crashed attempt (e.g. disk full) is cleaned up and retried.
ct2_path = Path(CT2_MODEL_DIR)
sentinel = ct2_path / ".done"
if not sentinel.exists():
    # Clean up any partial conversion from a previous failed attempt
    if ct2_path.exists():
        shutil.rmtree(ct2_path)

    print(f"Converting {MODEL_ID} to CTranslate2 INT8 format (one-time)...", flush=True)
    ct2_converter = ctranslate2.converters.TransformersConverter(MODEL_ID)
    ct2_converter.convert(CT2_MODEL_DIR, quantization="int8")
    sentinel.touch()
    print("Conversion complete.", flush=True)

    # Clean up HuggingFace model weights to save disk space.
    # The tokenizer files are small (<1MB) and cached separately.
    hf_cache = Path(os.environ.get("TRANSFORMERS_CACHE", "/models"))
    for blob in hf_cache.rglob("*.bin"):
        if "ct2" not in str(blob):
            blob.unlink(missing_ok=True)
            print(f"Cleaned up {blob}", flush=True)
    for blob in hf_cache.rglob("*.safetensors"):
        blob.unlink(missing_ok=True)
        print(f"Cleaned up {blob}", flush=True)

print(f"Loading CTranslate2 model from {CT2_MODEL_DIR}...", flush=True)
translator = ctranslate2.Translator(
    CT2_MODEL_DIR,
    compute_type="int8",
    inter_threads=1,
    intra_threads=INTRA_THREADS,
)
tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
print(f"Model loaded. CTranslate2 {ctranslate2.__version__}", flush=True)


class DualStackHTTPServer(HTTPServer):
    """HTTPServer that listens on IPv6 with dual-stack (accepts IPv4 too)."""

    address_family = socket.AF_INET6

    def server_bind(self):
        self.socket.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
        super().server_bind()


class Handler(BaseHTTPRequestHandler):
    def _check_auth(self) -> bool:
        """Validate Bearer token. Health endpoint is exempt."""
        if not API_KEY:
            return True
        token = self.headers.get("Authorization", "")
        if token == f"Bearer {API_KEY}":
            return True
        self.send_error(401, "Unauthorized")
        return False

    def do_GET(self):
        if self.path == "/health":
            self._json_response({"status": "ok"})
        else:
            self.send_error(404)

    def do_POST(self):
        if not self._check_auth():
            return

        if self.path == "/translate":
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length)
            data = json.loads(body)

            sources = data.get("source", [])
            src_lang = data.get("src_lang", "eng_Latn")
            tgt_lang = data.get("tgt_lang", "eng_Latn")

            if not sources:
                self._json_response({"translation": []})
                return

            # Tokenize all texts to token strings for CTranslate2
            tokenizer.src_lang = src_lang
            all_source_tokens = []
            for text in sources:
                encoded = tokenizer(text, return_tensors=None)["input_ids"]
                tokens = tokenizer.convert_ids_to_tokens(encoded)
                all_source_tokens.append(tokens)

            # CTranslate2 batch translation — handles variable-length
            # sequences efficiently without padding waste
            results = translator.translate_batch(
                all_source_tokens,
                target_prefix=[[tgt_lang]] * len(sources),
                max_decoding_length=256,
            )

            # Decode token strings back to text
            translations = []
            for result in results:
                target_tokens = result.hypotheses[0]
                target_ids = tokenizer.convert_tokens_to_ids(target_tokens)
                translations.append(
                    tokenizer.decode(target_ids, skip_special_tokens=True)
                )

            self._json_response({"translation": translations})
        else:
            self.send_error(404)

    def _json_response(self, obj):
        body = json.dumps(obj).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):
        print(f"{self.client_address[0]} {fmt % args}", flush=True)


if __name__ == "__main__":
    server = DualStackHTTPServer((HOST, PORT), Handler)
    print(f"Serving on [{HOST}]:{PORT}", flush=True)
    server.serve_forever()
