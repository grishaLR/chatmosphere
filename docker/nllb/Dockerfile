FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y \
    cmake \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY ../../proto proto

COPY . .
RUN TRANSLATOR_PROTO_PATH=proto/translator.proto make proto
ENV TRANSFORMERS_CACHE=/models
VOLUME /models
EXPOSE 6060
CMD ["python", "/app/serve.py"]
