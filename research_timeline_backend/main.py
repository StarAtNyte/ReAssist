#main.py
from fastapi import FastAPI, Query, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import openai
from models import TimelineResponse, Paper, Message, ChatRequest, ChatResponse,ResearchQuery, WebSocketMessage
from PaperAnalyzer import PaperAnalyzer
from api_wrappers import get_paper_recommendations, fetch_paper_details,PaperRecommendationService
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from paper_analyzer import ReviewPaperAnalyzer

load_dotenv()

app = FastAPI(title="ReAssist")

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = openai.OpenAI(
    api_key=os.environ.get("SAMBANOVA_API_KEY"),
    base_url="https://api.sambanova.ai/v1",
)
    
# Chat route
@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # Check if the request includes context for paper analysis
        context = request.context if request.context else None
        
        if context and 'papers' in context and 'analysisMode' in context:
            # Paper analysis scenario
            analyzer = PaperAnalyzer(client)
            analysis_result = await analyzer.analyze_papers(
                context['papers'], 
                context['analysisMode']
            )
            return ChatResponse(response=analysis_result)
        
        # Regular chat completion
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
            
            # Simulate incremental updates
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



