import type * as grpc from '@grpc/grpc-js';
import type { MessageTypeDefinition } from '@grpc/proto-loader';

import type {
  TranslateRequest as _nllb_TranslateRequest,
  TranslateRequest__Output as _nllb_TranslateRequest__Output,
} from './nllb/TranslateRequest.ts';
import type {
  TranslateResponse as _nllb_TranslateResponse,
  TranslateResponse__Output as _nllb_TranslateResponse__Output,
} from './nllb/TranslateResponse.ts';
import type {
  TranslationServiceClient as _nllb_TranslationServiceClient,
  TranslationServiceDefinition as _nllb_TranslationServiceDefinition,
} from './nllb/TranslationService.ts';

type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
  new (...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
  nllb: {
    TranslateRequest: MessageTypeDefinition<_nllb_TranslateRequest, _nllb_TranslateRequest__Output>;
    TranslateResponse: MessageTypeDefinition<
      _nllb_TranslateResponse,
      _nllb_TranslateResponse__Output
    >;
    TranslationService: SubtypeConstructor<typeof grpc.Client, _nllb_TranslationServiceClient> & {
      service: _nllb_TranslationServiceDefinition;
    };
  };
}
