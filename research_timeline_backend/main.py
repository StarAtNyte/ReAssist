# main.py

# main.py
from fastapi import FastAPI, Query, HTTPException
from pydantic import BaseModel
from typing import List
import os
import openai
from models import TimelineResponse, Paper
from api_wrappers import get_paper_recommendations, fetch_paper_details
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

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

# Chat models
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]

class ChatResponse(BaseModel):
    response: str

# Timeline route
@app.get("/timeline", response_model=TimelineResponse)
async def get_timeline(query: str, page: int = 1, page_size: int = 10):
    try:
        # Get paper recommendations using SambaNova API and Llama 3.2
        paper_titles = await get_paper_recommendations(query)
        
        # Fetch additional details about the papers using Semantic Scholar API
        papers = fetch_paper_details(paper_titles)
        
        # Pagination
        total_results = len(papers)
        start = (page - 1) * page_size
        end = start + page_size
        paginated_results = papers[start:end]

        return TimelineResponse(
            query=query,
            timeline=paginated_results,
            total_results=total_results,
            page=page,
            page_size=page_size
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Chat route
@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # Convert messages to the format expected by the SambaNova API
        formatted_messages = [
            {"role": "system", "content": "You are a helpful research assistant that provides detailed responses."}
        ] + [{"role": msg.role, "content": msg.content} for msg in request.messages]

        response = client.chat.completions.create(
            model="Llama-3.2-90B-Vision-Instruct",
            messages=formatted_messages,
            temperature=0.1,
            top_p=0.1
        )
        
        return ChatResponse(response=response.choices[0].message.content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Health check route
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)