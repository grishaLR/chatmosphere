#!/bin/bash

# Used to generate types from .proto file
npx proto-loader-gen-types \
  --longs=String \
  --enums=String \
  --defaults \
  --oneofs \
  --grpcLib=@grpc/grpc-js \
  --outDir=./generated \
  --targetFileExtension=.ts \
  --importFileExtension=.ts \
  ./translator.proto
