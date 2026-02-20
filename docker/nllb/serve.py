"""NLLB-200 translation server using CTranslate2 for fast CPU inference.

CTranslate2 is 3-5x faster than PyTorch for transformer models on CPU.
Uses INT8 quantization for an additional ~2x speedup with minimal quality loss.
Model is converted from HuggingFace format on first boot and cached on disk.

Binds to [::] (IPv6 dual-stack) so both IPv4 health checks and Fly's IPv6
internal networking (.internal DNS) work.
"""

import asyncio
import os
import shutil
import signal
from pathlib import Path

import ctranslate2
import grpc
from grpc_health.v1 import health, health_pb2, health_pb2_grpc
from transformers import AutoTokenizer

import translator_pb2
import translator_pb2_grpc

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


def get_or_default(v, default):
    if v == "" or v == None:
        return default
    return v


class AsyncTranslatorService(translator_pb2_grpc.TranslationService):
    async def Translate(self, request, context):
        loop = asyncio.get_running_loop()

        result = await loop.run_in_executor(None, self._translate, request)
        return result

    def _translate(self, request):
        sources = get_or_default(request.sources, [])
        src_lang = get_or_default(request.src_lang, "eng_Latn")
        tgt_lang = get_or_default(request.tgt_lang, "eng_Latn")

        if not sources:
            return translator_pb2.TranslateResponse(translations=[])

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
            translations.append(tokenizer.decode(target_ids, skip_special_tokens=True))

        return translator_pb2.TranslateResponse(translations=translations)


async def serve():
    server = grpc.aio.server()

    translator_pb2_grpc.add_TranslationServiceServicer_to_server(
        AsyncTranslatorService(), server
    )

    health_servicer = health.HealthServicer(experimental_non_blocking=True)
    health_pb2_grpc.add_HealthServicer_to_server(health_servicer, server)
    health_servicer.set("", health_pb2.HealthCheckResponse.SERVING)

    listen_addr = f"[{HOST}]:{PORT}"
    server.add_insecure_port(listen_addr)
    print(f"Async gRPC server starting on {listen_addr}")

    await server.start()

    shutdown_event = asyncio.Event()

    # Define a helper to trigger the event
    def signal_handler():
        print("\nShutdown signal received...")
        shutdown_event.set()

    # Register handlers for Ctrl+C (SIGINT) and container stops (SIGTERM)
    loop = asyncio.get_running_loop()
    for sig in (signal.SIGINT, signal.SIGTERM):
        loop.add_signal_handler(sig, signal_handler)

    # Wait until the shutdown event is set
    await shutdown_event.wait()

    # Start the graceful shutdown period
    # 5 seconds allows in-flight translations to finish
    print("Stopping server gracefully...")
    await server.stop(5)
    print("Server stopped.")


if __name__ == "__main__":
    asyncio.run(serve())
