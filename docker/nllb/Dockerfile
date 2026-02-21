FROM python:3.11-slim
WORKDIR /app

RUN apt-get update && apt-get install -y \
    cmake \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Fix 1: Copy from the local context to the current WORKDIR (.)
COPY requirements.txt requirements.txt

# Fix 2: Refer to the file in the current directory
RUN pip install --no-cache-dir -r requirements.txt

# Fix 3: Copy the rest of the files to the current WORKDIR
COPY . .

ENV TRANSFORMERS_CACHE=/models
VOLUME /models
EXPOSE 6060
CMD ["python", "/app/serve.py"]
