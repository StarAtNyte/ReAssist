import os
import openai
import requests
import re
from typing import List,Dict
from models import Paper,ResearchQuery
import getpass
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

if not os.getenv("SAMBANOVA_API_KEY"):
    os.environ["SAMBANOVA_API_KEY"] = getpass.getpass("Enter your SambaNova Cloud API key: ")

client = openai.OpenAI(
    api_key=os.environ.get("SAMBANOVA_API_KEY"),
    base_url="https://api.sambanova.ai/v1",
)

SEMANTIC_SCHOLAR_API_URL = "https://api.semanticscholar.org/graph/v1/paper/search"

def extract_string_inside_quotes(s: str) -> str:
    """
    Extract the string inside double quotes from a given string.
    """
    match = re.search(r'"([^"]*)"', s)
    return match.group(1) if match else None

async def get_paper_recommendations(topic: str) -> List[str]:
    """
    Queries Llama 3.2 for foundational papers on a specific topic.
    """
    response = client.chat.completions.create(
        model="Llama-3.2-90B-Vision-Instruct",
        messages=[
            {"role": "system", "content": "You are a helpful research assistant that provides a list of research papers."},
            {"role": "user", "content": f"Can you provide a list of 15 research papers that can be of great help in learning '{topic}'? The core paper related to this topic might be the first. Return only the title of the paper inside double inverted commas. Do not repeat the papers"}
        ],
        temperature=0.1,
        top_p=0.1
    )

    paper_titles = []
    for result in response.choices[0].message.content.split("\n"):
        paper_title = extract_string_inside_quotes(result)
        if paper_title:
            paper_titles.append(paper_title)
    return list(set(paper_titles))  

def fetch_paper_details(paper_titles: List[str]) -> List[Paper]:
    """
    Uses the Semantic Scholar API to fetch additional details about each paper.
    Returns a list of Paper objects with proper error handling for missing fields.
    """
    papers = []
    for title in paper_titles:
        try:
            params = {
                "query": title,
                "fields": "title,authors,abstract,year,url",
                "limit": 1
            }
            response = requests.get(SEMANTIC_SCHOLAR_API_URL, params=params)
            response.raise_for_status()  
            
            data = response.json()
            if data.get("data") and len(data["data"]) > 0:
                result = data["data"][0]
                fallback_url = f"https://www.semanticscholar.org/search?q={title.replace(' ', '+')}",
                papers.append(Paper(
                    title=result.get("title", "Unknown Title"),
                    authors=[author.get("name", "Unknown Author") for author in result.get("authors", [])],
                    abstract=result.get("abstract") or "Abstract not available.",
                    publication_date=str(result.get("year", "Unknown Year")),
                    link=result.get("url", fallback_url)
                ))
            else:
                papers.append(Paper(
                    title=title,
                    authors=["Author not found"],
                    abstract="No paper details available in Semantic Scholar.",
                    publication_date="Year unknown",
                    link=""
                ))

        except requests.RequestException as e:
            print(f"Error fetching details for paper '{title}': {str(e)}")
            papers.append(Paper(
                title=title,
                authors=["Author not found"],
                abstract=f"Error fetching paper details: {str(e)}",
                publication_date="Year unknown",
                link=""
            ))
    return papers

class PaperRecommendationService:
    def __init__(self, api_key: str = None):
        self.client = openai.OpenAI(
            api_key=os.environ.get("SAMBANOVA_API_KEY"),
            base_url="https://api.sambanova.ai/v1",
        )
        self.semantic_scholar_url = "https://api.semanticscholar.org/graph/v1/paper/search"

    def extract_titles(self, text: str) -> List[str]:
        """Extract paper titles from AI-generated text"""
        return re.findall(r'"([^"]*)"', text)

    async def get_paper_recommendations(self, query: ResearchQuery) -> List[str]:
        """Generate paper recommendations using Llama 3.2"""
        prompt = f"""
        Provide 20 foundational and cutting-edge research papers for the topic: {query.topic}
        Research Depth: {query.research_depth}
        Sub-domains: {', '.join(query.sub_domains) if query.sub_domains else 'Not specified'}

        Guidelines:
        - Include diverse perspectives
        - Cover both classical and recent publications
        - Prioritize high-impact and well-cited papers
        
        Format: Return titles in double quotes, one per line
        """

        response = self.client.chat.completions.create(
            model="Llama-3.2-90B-Vision-Instruct",
            messages=[
                {"role": "system", "content": "You are an expert research paper recommender."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3
        )

        return self.extract_titles(response.choices[0].message.content)

    def fetch_paper_details(self, titles: List[str]) -> List[Paper]:
        """Fetch detailed information about recommended papers"""
        papers = []
        for title in titles:
            try:
                params = {
                    "query": title,
                    "fields": "title,authors,abstract,year,url,citationCount",
                    "limit": 1
                }
                response = requests.get(self.semantic_scholar_url, params=params)
                data = response.json()

                if data.get("data") and data["data"]:
                    paper_data = data["data"][0]
                    papers.append(Paper(
                        title=paper_data.get("title", title),
                        authors=[author.get("name", "Unknown") for author in paper_data.get("authors", [])],
                        abstract=paper_data.get("abstract", "No abstract available"),
                        publication_date=str(paper_data.get("year", "Unknown")),
                        link=paper_data.get("url", ""),
                        citations=paper_data.get("citationCount", 0),
                        relevance_score=self._calculate_relevance_score(paper_data)
                    ))
            except Exception as e:
                print(f"Error fetching paper details: {e}")

        return sorted(papers, key=lambda x: x.relevance_score, reverse=True)

    def _calculate_relevance_score(self, paper_data: Dict) -> float:
        """Calculate paper relevance based on multiple factors"""
        citations = paper_data.get("citationCount", 0)
        recency = datetime.now().year - paper_data.get("year", datetime.now().year)
        
        base_score = min(citations / 100, 1.0) 
        recency_factor = max(1 - (recency / 10), 0.1) 
        
        return base_score * recency_factor * 100