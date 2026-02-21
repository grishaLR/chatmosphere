FROM python:3.11-slim
WORKDIR /app

RUN apt-get update && apt-get install -y \
    cmake \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy the local 'proto' folder (which now contains a hard-linked file)
COPY proto/ /app/proto/
COPY . /app

# Ensure the path matches where the file sits in the container
RUN TRANSLATOR_PROTO_PATH=/app/proto/translator.proto make proto

ENV TRANSFORMERS_CACHE=/models
VOLUME /models
EXPOSE 6060
CMD ["python", "/app/serve.py"]
