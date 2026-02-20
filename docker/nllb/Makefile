# Variables
VENV := venv
PYTHON := $(VENV)/bin/python
PIP := $(VENV)/bin/pip

# Default target
all: proto

TRANSLATOR_PROTO_PATH := ../../proto/translator.proto

# Create venv only if it doesn't exist
# We use the activation script as a "sentinel" file to track installation
$(VENV)/bin/activate: requirements.txt
	@echo "Checking/Creating virtual environment..."
	test -d $(VENV) || python3 -m venv $(VENV)
	$(PIP) install --upgrade pip
	$(PIP) install -r requirements.txt
	touch $(VENV)/bin/activate

# Phony target for user convenience
.PHONY: venv
venv: $(VENV)/bin/activate

# Only regenerate proto files if .proto file OR venv has changed
translator_pb2.py: $(TRANSLATOR_PROTO_PATH) $(VENV)/bin/activate
	$(PYTHON) -m grpc_tools.protoc \
		-I ../../proto \
		--python_out=. \
		--pyi_out=. \
		--grpc_python_out=. \
		$(TRANSLATOR_PROTO_PATH)

.PHONY: proto
proto: translator_pb2.py

.PHONY: run
run-local: proto
	python serve.py

# Clean up
.PHONY: clean
clean:
	rm -f *_pb2.py *_pb2_grpc.py
