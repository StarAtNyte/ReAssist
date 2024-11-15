from pydantic import BaseModel
from typing import List, Optional

class Paper(BaseModel):
    title: str
    authors: List[str]
    abstract: str
    publication_date: str
    link: str

class TimelineResponse(BaseModel):
    query: str
    timeline: List[Paper]
    total_results: int
    page: int
    page_size: int