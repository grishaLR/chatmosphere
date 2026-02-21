// Original file: translator.proto

import type * as grpc from '@grpc/grpc-js';
import type { MethodDefinition } from '@grpc/proto-loader';
import type {
  TranslateRequest as _nllb_TranslateRequest,
  TranslateRequest__Output as _nllb_TranslateRequest__Output,
} from '../nllb/TranslateRequest.ts';
import type {
  TranslateResponse as _nllb_TranslateResponse,
  TranslateResponse__Output as _nllb_TranslateResponse__Output,
} from '../nllb/TranslateResponse.ts';

export interface TranslationServiceClient extends grpc.Client {
  Translate(
    argument: _nllb_TranslateRequest,
    metadata: grpc.Metadata,
    options: grpc.CallOptions,
    callback: grpc.requestCallback<_nllb_TranslateResponse__Output>,
  ): grpc.ClientUnaryCall;
  Translate(
    argument: _nllb_TranslateRequest,
    metadata: grpc.Metadata,
    callback: grpc.requestCallback<_nllb_TranslateResponse__Output>,
  ): grpc.ClientUnaryCall;
  Translate(
    argument: _nllb_TranslateRequest,
    options: grpc.CallOptions,
    callback: grpc.requestCallback<_nllb_TranslateResponse__Output>,
  ): grpc.ClientUnaryCall;
  Translate(
    argument: _nllb_TranslateRequest,
    callback: grpc.requestCallback<_nllb_TranslateResponse__Output>,
  ): grpc.ClientUnaryCall;
  translate(
    argument: _nllb_TranslateRequest,
    metadata: grpc.Metadata,
    options: grpc.CallOptions,
    callback: grpc.requestCallback<_nllb_TranslateResponse__Output>,
  ): grpc.ClientUnaryCall;
  translate(
    argument: _nllb_TranslateRequest,
    metadata: grpc.Metadata,
    callback: grpc.requestCallback<_nllb_TranslateResponse__Output>,
  ): grpc.ClientUnaryCall;
  translate(
    argument: _nllb_TranslateRequest,
    options: grpc.CallOptions,
    callback: grpc.requestCallback<_nllb_TranslateResponse__Output>,
  ): grpc.ClientUnaryCall;
  translate(
    argument: _nllb_TranslateRequest,
    callback: grpc.requestCallback<_nllb_TranslateResponse__Output>,
  ): grpc.ClientUnaryCall;
}

export interface TranslationServiceHandlers extends grpc.UntypedServiceImplementation {
  Translate: grpc.handleUnaryCall<_nllb_TranslateRequest__Output, _nllb_TranslateResponse>;
}

export interface TranslationServiceDefinition extends grpc.ServiceDefinition {
  Translate: MethodDefinition<
    _nllb_TranslateRequest,
    _nllb_TranslateResponse,
    _nllb_TranslateRequest__Output,
    _nllb_TranslateResponse__Output
  >;
}
