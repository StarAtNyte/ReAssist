
# api_wrappers.py

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
                papers.append(Paper(
                    title=result.get("title", "Unknown Title"),
                    authors=[author.get("name", "Unknown Author") for author in result.get("authors", [])],
                    abstract=result.get("abstract") or "Abstract not available.",
                    publication_date=str(result.get("year", "Unknown Year")),
                    link=result.get("url", "")
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

# Example usage
paper = fetch_paper_details(["A Model for Organized Pattern Recognition and Retrieval of Information"])
print(paper)