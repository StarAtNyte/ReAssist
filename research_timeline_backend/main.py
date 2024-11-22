from fastapi import FastAPI, Query, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel,Field
from typing import List, Optional, Dict, Any,Union
import os
import openai
from models import TimelineResponse, Paper, Message, ChatRequest, ChatResponse,ResearchQuery, WebSocketMessage
from PaperAnalyzer import PaperAnalyzer
from api_wrappers import get_paper_recommendations, fetch_paper_details,PaperRecommendationService
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from paper_analyzer import ReviewPaperAnalyzer
from semantic_network_visualizer import SemanticNetworkVisualizer
import logging
import traceback

load_dotenv()

app = FastAPI(title="ReAssist")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PaperModel(BaseModel):
    title: str = Field(..., description="Title of the research paper")
    abstract: Optional[str] = Field(default="", description="Abstract of the paper")
    id: Optional[str] = Field(default=None, description="Unique identifier for the paper")

class PapersRequest(BaseModel):
    papers: List[Union[PaperModel, Dict[str, Any]]]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = openai.OpenAI(
    api_key=os.environ.get("SAMBANOVA_API_KEY"),
    base_url="https://api.sambanova.ai/v1",
)

def normalize_papers(papers: List[Union[PaperModel, Dict[str, Any]]]) -> List[Dict[str, Any]]:
    """
    Normalize papers input to ensure consistent dictionary format
    """
    normalized_papers = []
    for paper in papers:
        if isinstance(paper, dict):
            normalized_paper = {
                'title': paper.get('title', 'Untitled'),
                'abstract': paper.get('abstract', ''),
                'id': paper.get('id', str(hash(paper.get('title', ''))))
            }
        elif isinstance(paper, PaperModel):
            normalized_paper = paper.dict()
        else:
            logger.warning(f"Skipping invalid paper format: {paper}")
            continue
        
        normalized_papers.append(normalized_paper)
    
    return normalized_papers

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        context = request.context if request.context else None
        
        if context and 'papers' in context and 'analysisMode' in context:
            # Paper analysis scenario
            analyzer = PaperAnalyzer(client)
            analysis_result = await analyzer.analyze_papers(
                context['papers'], 
                context['analysisMode']
            )
            return ChatResponse(response=analysis_result)
        
        formatted_messages = [
            {"role": "system", "content": "You are a helpful research assistant that provides detailed responses."}
        ] + [{"role": msg.role, "content": msg.content} for msg in request.messages]

        response = client.chat.completions.create(
            model="Meta-Llama-3.1-405B-Instruct",
            messages=formatted_messages,
            temperature=0.1,
            top_p=0.1
        )         
        
        return ChatResponse(response=response.choices[0].message.content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
paper_service = PaperRecommendationService()
review_paper_analyzer = ReviewPaperAnalyzer(paper_service.client)

@app.post("/research/recommend")
async def recommend_papers(query: ResearchQuery):
    """Generate paper recommendations based on research query"""
    titles = await paper_service.get_paper_recommendations(query)
    papers = paper_service.fetch_paper_details(titles)
    
    return {
        "query": query,
        "papers": papers,
        "total_papers": len(papers)
    }

@app.post("/research/analyze")
async def analyze_research(query: ResearchQuery):
    """Comprehensive research analysis"""
    titles = await paper_service.get_paper_recommendations(query)
    papers = paper_service.fetch_paper_details(titles)
    
    thematic_analysis = await review_paper_analyzer.analyze_papers(papers, mode="thematic")
    comparative_analysis = await review_paper_analyzer.analyze_papers(papers, mode="comparative")
    
    return {
        "thematic_insights": thematic_analysis,
        "comparative_insights": comparative_analysis
    }

@app.websocket("/research/updates")
async def websocket_research_updates(websocket: WebSocket):
    """WebSocket endpoint for real-time research progress"""
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            query = ResearchQuery(**data)
            
            await websocket.send_json({
                "type": "research_started",
                "message": f"Starting research on {query.topic}"
            })
            
            titles = await paper_service.get_paper_recommendations(query)
            
            await websocket.send_json({
                "type": "paper_recommendations",
                "papers": titles
            })
            
    except WebSocketDisconnect:
        print("WebSocket disconnected")



semantic_visualizer = SemanticNetworkVisualizer()

class PapersRequest(BaseModel):
    papers: List[Dict[str, Any]]

@app.post("/semantic-network/graph")
async def generate_semantic_graph(request: PapersRequest):
    try:
        papers = normalize_papers(request.papers)
        
        if not papers:
            raise HTTPException(status_code=400, detail="No valid papers provided")
        
        visualizer = SemanticNetworkVisualizer()
        
        graph = visualizer.build_knowledge_graph(papers)
        
        graph_data = {
            "nodes": [{"id": node, "label": node} for node in graph.nodes()],
            "edges": [
                {
                    "from": edge[0], 
                    "to": edge[1], 
                    "label": graph.edges[edge].get('type', 'related')
                } 
                for edge in graph.edges()
            ]
        }
        
        return graph_data
    
    except Exception as e:
        logger.error(f"Graph generation error: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Graph generation failed: {str(e)}")

@app.post("/semantic-network/connections")
async def generate_semantic_connections(request: PapersRequest):
    try:
        papers = normalize_papers(request.papers)
        
        if not papers:
            raise HTTPException(status_code=400, detail="No valid papers provided")
        
        visualizer = SemanticNetworkVisualizer()
        
        connections = visualizer.extract_semantic_connections(papers)
        
        return {
            "connections": connections.get('connections', []),
            "error": connections.get('error', None)
        }
    
    except Exception as e:
        logger.error(f"Connections generation error: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Connections generation failed: {str(e)}")

@app.post("/semantic-network/contradictions")
async def generate_contradictions(request: PapersRequest):
    try:
        papers = normalize_papers(request.papers)
        
        if not papers:
            raise HTTPException(status_code=400, detail="No valid papers provided")
        
        visualizer = SemanticNetworkVisualizer()
        
        contradictions = visualizer.identify_contradictions(papers)
        
        return {"contradictions": contradictions}
    
    except Exception as e:
        logger.error(f"Contradictions generation error: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Contradictions generation failed: {str(e)}")

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unexpected error: {exc}")
    logger.error(traceback.format_exc())
    return {"error": str(exc)}

@app.post("/semantic-network/visualize")
async def visualize_network(request: PapersRequest):
    """
    Generate a visualization of the semantic network
    """
    try:
        semantic_visualizer.build_knowledge_graph(request.papers)
        visualization_path = semantic_visualizer.visualize_knowledge_graph()
        
        return {
            "visualization_path": visualization_path,
            "message": "Visualization generated successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))