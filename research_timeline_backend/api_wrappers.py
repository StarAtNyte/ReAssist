import os
import openai
import requests
import re
from typing import List
from models import Paper
import getpass

# Set up SambaNova API key and OpenAI client
os.environ["SAMBANOVA_API_KEY"] = "f158e69e-a896-4eed-bb5a-d528a12f5ec2"
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
            {"role": "user", "content": f"Can you provide a list of 15 research papers that led to the foundation of the topic '{topic}'? The core paper related to this topic should be the last. Return only the title of the paper inside double inverted commas. Do not repeat the papers"}
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
            response.raise_for_status()  # Raise an exception for bad status codes
            
            data = response.json()
            if data.get("data") and len(data["data"]) > 0:
                result = data["data"][0]
                # Ensure all fields have default values if they're missing
                fallback_url = f"https://www.semanticscholar.org/search?q={title.replace(' ', '+')}",
                papers.append(Paper(
                    title=result.get("title", "Unknown Title"),
                    authors=[author.get("name", "Unknown Author") for author in result.get("authors", [])],
                    abstract=result.get("abstract") or "Abstract not available.",
                    publication_date=str(result.get("year", "Unknown Year")),
                    link=result.get("url", fallback_url)
                ))
            else:
                # Handle case where no results were found
                papers.append(Paper(
                    title=title,
                    authors=["Author not found"],
                    abstract="No paper details available in Semantic Scholar.",
                    publication_date="Year unknown",
                    link=""
                ))
        except requests.RequestException as e:
            # Handle API request errors
            print(f"Error fetching details for paper '{title}': {str(e)}")
            papers.append(Paper(
                title=title,
                authors=["Author not found"],
                abstract=f"Error fetching paper details: {str(e)}",
                publication_date="Year unknown",
                link=""
            ))
    return papers