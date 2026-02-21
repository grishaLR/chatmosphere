// Original file: translator.proto

export interface TranslateRequest {
  sources?: string[];
  srcLang?: string;
  tgtLang?: string;
}

export interface TranslateRequest__Output {
  sources: string[];
  srcLang: string;
  tgtLang: string;
}
