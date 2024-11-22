from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, Query, HTTPException
import asyncio
from datetime import datetime

class Author(BaseModel):
    name: str
    affiliation: Optional[str] = None

class Paper(BaseModel):
    title: str
    authors: List[str]
    abstract: Optional[str] = None
    publication_date: str
    link: str
    citations: Optional[int] = 0
    relevance_score: float = 0.0

class TimelineResponse(BaseModel):
    query: str
    timeline: List[Paper]
    total_results: int
    page: int
    page_size: int

class ChatRequest(BaseModel):
    messages: List[str]
    context: Optional[Dict[str, Any]] = None

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    response: str

class ResearchQuery(BaseModel):
    topic: str
    sub_domains: Optional[List[str]] = []
    research_depth: str = Field(
        default="comprehensive", 
        pattern="^(basic|intermediate|comprehensive)$"
    )

class ResearchStrategy(BaseModel):
    research_questions: List[str]
    key_databases: List[str]
    suggested_keywords: List[str]
    potential_research_gaps: List[str]
    interdisciplinary_connections: List[str]

class LiteratureReviewResponse(BaseModel):
    query: ResearchQuery
    strategy: ResearchStrategy
    recommended_papers: List[Paper]
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class WebSocketMessage(BaseModel):
    type: str
    data: Optional[Dict[str, Any]] = None

class SemanticNode(BaseModel):
    id: str
    label: str
    type: str
    size: float
    color: str
    metadata: Optional[Dict[str, Any]] = None

class SemanticEdge(BaseModel):
    source: str
    target: str
    weight: float
    type: str

class SemanticNetwork(BaseModel):
    nodes: List[SemanticNode]
    edges: List[SemanticEdge]
    metadata: Optional[Dict[str, Any]] = None

class NetworkMetrics(BaseModel):
    centrality: Dict[str, float]
    communities: List[List[str]]
    impact_scores: Dict[str, float]
    innovation_potential: Dict[str, float]