from pydantic import BaseModel
from typing import List

class EmbeddingResponse(BaseModel):
    embedding: List[float]

class NamingRequest(BaseModel):
    captions: List[str]

class NamingResponse(BaseModel):
    name: str