# main.py
from fastapi import FastAPI, Query, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import openai
from models import TimelineResponse, Paper
from api_wrappers import get_paper_recommendations, fetch_paper_details
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import asyncio

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
    context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    response: str

class PaperAnalyzer:
    def __init__(self, openai_client):
        self.client = openai_client
        self.analysis_strategies = {
            'Overview': self._generate_overview,
            'Visual Summary': self._generate_visual_summary,
            'Figure Extraction': self._extract_figures,
            'Key Insights': self._extract_key_insights,
            'Citation Analysis': self._analyze_citations,
            'Comparative Analysis': self._comparative_analysis
        }

    async def analyze_papers(self, papers: List[Dict], analysis_mode: str) -> str:
        """
        Analyze papers based on the selected analysis mode
        
        :param papers: List of paper dictionaries
        :param analysis_mode: Specific analysis mode to apply
        :return: Detailed analysis response
        """
        try:
            # Validate analysis mode
            if analysis_mode not in self.analysis_strategies:
                raise ValueError(f"Unsupported analysis mode: {analysis_mode}")

            # Fetch analysis strategy
            analysis_method = self.analysis_strategies[analysis_mode]
            
            # Generate analysis
            return await analysis_method(papers)
        
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    async def _generate_overview(self, papers: List[Dict]) -> str:
        """Generate a comprehensive overview of the selected papers"""
        paper_details = [
            f"Paper: {p.get('title', 'Untitled')}\n"
            f"Authors: {', '.join(p.get('authors', []))}\n"
            f"Publication Date: {p.get('publication_date', 'Unknown')}\n"
            f"Abstract: {p.get('abstract', 'No abstract available')}\n"
            for p in papers
        ]
        
        prompt = f"""
        Provide a comprehensive overview of the following research papers:

        {chr(10).join(paper_details)}

        Write a synthesis that highlights:
        1. Common themes across the papers
        2. Unique contributions of each paper
        3. Potential research implications
        4. Interconnections between the papers
        """
        
        return await self._generate_llm_response(prompt)

    async def _generate_visual_summary(self, papers: List[Dict]) -> str:
        """Generate a markdown-based visual summary of the papers"""
        prompt = f"""
        Create a visually engaging markdown summary for these research papers that includes:
        - A timeline of publications
        - Comparative icons or badges representing key attributes
        - Color-coded insights
        - Key visual metaphors for research domains

        Papers to summarize:
        {chr(10).join([p.get('title', 'Untitled') for p in papers])}

        Output Format:
        ## Research Landscape Visual Summary

        ### Timeline
        {'{timeline_placeholder}'}

        ### Key Insights Visualization
        {'{visual_insights_placeholder}'}

        ### Comparative Analysis
        {'{comparative_badges_placeholder}'}
        """
        
        return await self._generate_llm_response(prompt)

    async def _extract_figures(self, papers: List[Dict]) -> str:
        """Extract and describe key figures from the papers"""
        prompt = f"""
        For the following papers, describe the most significant figures or visual representations:

        {chr(10).join([f"- {p.get('title', 'Untitled')}" for p in papers])}

        For each paper, provide:
        1. Description of key figures
        2. Context of the figure in the research
        3. Visual metaphor or simplified explanation
        4. Potential implications of the visual data
        """
        
        return await self._generate_llm_response(prompt)

    async def _extract_key_insights(self, papers: List[Dict]) -> str:
        """Extract and synthesize key insights across papers"""
        prompt = f"""
        Analyze the following research papers and extract the most critical insights:

        {chr(10).join([f"- {p.get('title', 'Untitled')}" for p in papers])}

        For each paper, identify and explain:
        1. Primary research question
        2. Most significant finding
        3. Methodology innovation
        4. Potential real-world application
        5. Limitations or areas for further research

        Synthesize these insights into a coherent narrative that shows the broader research landscape.
        """
        
        return await self._generate_llm_response(prompt)

    async def _analyze_citations(self, papers: List[Dict]) -> str:
        """Perform a comprehensive citation network analysis"""
        prompt = f"""
        Conduct a detailed citation analysis for these research papers:

        {chr(10).join([f"- {p.get('title', 'Untitled')} (Citations: {p.get('citations', 0)})" for p in papers])}

        Analyze and report on:
        1. Citation counts and trends
        2. Most frequently cited papers in the set
        3. Citation network and interconnections
        4. Impact and influence of each paper
        5. Emerging research domains suggested by citations
        """
        
        return await self._generate_llm_response(prompt)

    async def _comparative_analysis(self, papers: List[Dict]) -> str:
        """Perform a comparative analysis across the selected papers"""
        prompt = f"""
        Conduct an in-depth comparative analysis of these research papers:

        {chr(10).join([f"- {p.get('title', 'Untitled')}" for p in papers])}

        Comparative Analysis Framework:
        1. Methodological Approaches
        2. Theoretical Foundations
        3. Empirical Results
        4. Limitations and Constraints
        5. Potential Synergies and Complementary Research

        Provide a nuanced comparison that goes beyond surface-level differences.
        """
        
        return await self._generate_llm_response(prompt)

    async def _generate_llm_response(self, prompt: str, max_tokens: int = 1000) -> str:
        """Generate a response using the LLM"""
        try:
            response = await asyncio.to_thread(
                self.client.chat.completions.create,
                model="Llama-3.2-90B-Vision-Instruct",
                messages=[
                    {"role": "system", "content": "You are a sophisticated research analysis assistant."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2,
                max_tokens=max_tokens
            )
            
            return response.choices[0].message.content
        
        except Exception as e:
            return f"Analysis generation error: {str(e)}"
        
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
            model="Llama-3.2-90B-Vision-Instruct",
            messages=formatted_messages,
            temperature=0.1,
            top_p=0.1
        )
        
        return ChatResponse(response=response.choices[0].message.content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))