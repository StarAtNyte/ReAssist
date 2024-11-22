# semantic_network/models.py
from pydantic import BaseModel
from typing import List, Dict, Optional

class Node(BaseModel):
    id: str
    label: str
    type: str  # 'paper', 'concept', or 'author'
    metadata: Dict  # stores additional information like citations, year, etc.
    score: float  # for sizing nodes based on importance

class Edge(BaseModel):
    source: str
    target: str
    type: str  # 'cites', 'references', 'relates_to', etc.
    weight: float  # strength of connection
    metadata: Dict  # additional relationship information

class NetworkData(BaseModel):
    nodes: List[Node]
    edges: List[Edge]
