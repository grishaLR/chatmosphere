FROM python:3.11-slim
RUN pip install --no-cache-dir "transformers>=4.48" sentencepiece ctranslate2 \
    && pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu
COPY serve.py /app/serve.py
ENV TRANSFORMERS_CACHE=/models
VOLUME /models
EXPOSE 6060
CMD ["python", "/app/serve.py"]
