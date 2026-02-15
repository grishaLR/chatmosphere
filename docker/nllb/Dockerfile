FROM python:3.11-slim
RUN pip install --no-cache-dir "transformers>=4.38,<4.48" torch flask gunicorn sentencepiece
COPY serve.py /app/serve.py
ENV TRANSFORMERS_CACHE=/models
VOLUME /models
EXPOSE 6060
CMD ["python", "/app/serve.py"]
