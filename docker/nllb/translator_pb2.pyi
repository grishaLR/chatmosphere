from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from collections.abc import Iterable as _Iterable
from typing import ClassVar as _ClassVar, Optional as _Optional

DESCRIPTOR: _descriptor.FileDescriptor

class TranslateRequest(_message.Message):
    __slots__ = ("sources", "src_lang", "tgt_lang")
    SOURCES_FIELD_NUMBER: _ClassVar[int]
    SRC_LANG_FIELD_NUMBER: _ClassVar[int]
    TGT_LANG_FIELD_NUMBER: _ClassVar[int]
    sources: _containers.RepeatedScalarFieldContainer[str]
    src_lang: str
    tgt_lang: str
    def __init__(self, sources: _Optional[_Iterable[str]] = ..., src_lang: _Optional[str] = ..., tgt_lang: _Optional[str] = ...) -> None: ...

class TranslateResponse(_message.Message):
    __slots__ = ("translations",)
    TRANSLATIONS_FIELD_NUMBER: _ClassVar[int]
    translations: _containers.RepeatedScalarFieldContainer[str]
    def __init__(self, translations: _Optional[_Iterable[str]] = ...) -> None: ...
