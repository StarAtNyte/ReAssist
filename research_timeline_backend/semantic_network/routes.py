# semantic_network/routes.py
from fastapi import APIRouter, HTTPException, Depends,Request
from typing import List,Dict,Union
from .analyzer import SemanticNetworkAnalyzer
from .models import Paper,Node,Edge,NetworkAnalytics,NetworkData,ConceptRelation
import os
import openai
from dotenv import load_dotenv
from pydantic import BaseModel
import logging
import json
load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# API Router
router = APIRouter(tags=["semantic-network"])

# Dependencies
async def get_openai_client():
    api_key = os.environ.get("SAMBANOVA_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="Environment variable SAMBANOVA_API_KEY is missing."
        )
    try:
        client = openai.OpenAI(
            api_key=api_key,
            base_url="https://api.sambanova.ai/v1",
        )
        return client
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to initialize AI client: {str(e)}"
        )

# API Endpoints
@router.post("/generate", response_model=NetworkData)
async def generate_network(
    papers: List[Union[Paper, Dict]],  # Allow both Paper models and dictionaries
    client: openai.OpenAI = Depends(get_openai_client)
):
    """Generate semantic network from papers."""
    try:
        # Convert any dictionaries to Paper models if needed
        processed_papers = []
        logger.info(f"Generating network for {len(papers)} papers")
        for paper in papers:
            if isinstance(paper, dict):
                paper = Paper(**paper)
            processed_papers.append(paper)

        analyzer = SemanticNetworkAnalyzer(client)
        network = await analyzer.build_network(processed_papers)
        return network
    except Exception as e:
        logger.error(f"Network generation failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error in network generation: {str(e)}"
        )
    
@router.post("/analyze", response_model=NetworkAnalytics)
async def analyze_network(
    network: NetworkData,
    client: openai.OpenAI = Depends(get_openai_client)
):
    """Analyze the semantic network."""
    try:
        # Extract key concepts (nodes with highest degree centrality)
        concept_nodes = [n for n in network.nodes if n.type == "concept"]
        key_concepts = sorted(
            concept_nodes,
            key=lambda x: len([e for e in network.edges if x.id in [e.source, e.target]]),
            reverse=True
        )[:10]
        
        # Calculate research impact
        paper_nodes = [n for n in network.nodes if n.type == "paper"]
        research_impact = {
            p.label: len([e for e in network.edges if p.id in [e.source, e.target]]) 
            for p in paper_nodes
        }
        
        # Detect potential contradictions
        contradictions = []
        paper_pairs = [(p1, p2) for i, p1 in enumerate(paper_nodes) for p2 in paper_nodes[i+1:]]
        for p1, p2 in paper_pairs:
            # Check if papers share concepts but have different conclusions
            shared_concepts = set([
                e.target for e in network.edges 
                if e.source == p1.id and e.type == "contains"
            ]) & set([
                e.target for e in network.edges 
                if e.source == p2.id and e.type == "contains"
            ])
            
            if shared_concepts:
                try:
                    response = await client.chat.completions.create(
                        model="Llama-3.2-11B-Vision-Instruct",
                        messages=[
                            {"role": "system", "content": "Analyze if these papers have contradicting findings."},
                            {"role": "user", "content": f"Compare:\nPaper 1: {p1.metadata['abstract']}\nPaper 2: {p2.metadata['abstract']}"}
                        ],
                        temperature=0.2
                    )
                    
                    if "contradiction" in response.choices[0].message.content.lower():
                        contradictions.append({
                            "paper1": p1.label,
                            "paper2": p2.label,
                            "contradiction": response.choices[0].message.content
                        })
                except Exception as e:
                    print(f"Error analyzing contradictions: {str(e)}")
                    continue
        
        return NetworkAnalytics(
            key_concepts=[n.label for n in key_concepts],
            research_impact=research_impact,
            contradictions=contradictions
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Network analysis failed: {str(e)}"
        )