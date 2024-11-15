# main.py

from fastapi import FastAPI, Query
from models import TimelineResponse
from api_wrappers import get_paper_recommendations, fetch_paper_details
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Adjust this to match your frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/timeline", response_model=TimelineResponse)
async def get_timeline(query: str, page: int = 1, page_size: int = 10):
    # Get paper recommendations using SambaNova API and Llama 3.2
    paper_titles = await get_paper_recommendations(query)
    print(paper_titles)
    # Fetch additional details about the papers using Semantic Scholar API
    papers = fetch_paper_details(paper_titles)
    print(papers)
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
