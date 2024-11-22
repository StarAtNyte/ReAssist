# semantic_network/analyzer.py
import openai
from typing import List, Dict,Union
import networkx as nx
from .models import Node, Edge, NetworkData
from models import Paper
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Depends
import hashlib
import json

load_dotenv()



class SemanticNetworkAnalyzer:
    def __init__(self, client: openai.OpenAI):
        self.client = client
        self.graph = nx.Graph()

    def _extract_concepts(self, text: str) -> List[str]:
        """Extract key concepts from text using Llama."""
        response = self.client.chat.completions.create(
            model="Llama-3.2-11B-Vision-Instruct",
            messages=[
                {"role": "system", "content": "Extract key research concepts from the text, return as comma-separated list."},
                {"role": "user", "content": f"Extract key concepts from: {text}"}
            ],
            temperature=0.1
        )
        concepts = response.choices[0].message.content.split(',')
        return [c.strip() for c in concepts]

    def _analyze_concept_relationships(self, concepts: List[str], abstract: str) -> List[Dict]:
        """Analyze relationships between concepts using Llama."""
        prompt = f"""
        Analyze the relationships between these concepts in the given text:
        Concepts: {', '.join(concepts)}
        Text: {abstract}
        
        IMPORTANT: 
        - Respond ONLY with a valid JSON array of relationships
        - Each relationship must have 'source', 'target', 'weight', and 'type' keys
        - If no clear relationships exist, return an empty array []
        - Ensure valid JSON formatting

        Example output:
        [{{
            "source": "concept1",
            "target": "concept2", 
            "weight": 0.7,
            "type": "supports"
        }}]
        """
        
        max_attempts = 3
        for attempt in range(max_attempts):
            try:
                response = self.client.chat.completions.create(
                    model="Llama-3.2-11B-Vision-Instruct",
                    messages=[
                        {"role": "system", "content": "You are a precise research relationship analyzer. Always respond with valid JSON."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.2,
                    response_format={"type": "json_object"}
                )
                
                # Try parsing the response
                relationships = json.loads(response.choices[0].message.content)
                
                # Validate the relationships
                validated_relationships = []
                for rel in relationships:
                    if all(key in rel for key in ['source', 'target', 'weight', 'type']):
                        validated_relationships.append(rel)
                
                return validated_relationships
            
            except (json.JSONDecodeError, KeyError) as e:
                print(f"JSON parsing attempt {attempt + 1} failed: {e}")
                # On final attempt, return an empty list
                if attempt == max_attempts - 1:
                    print("Failed to parse relationships. Returning empty list.")
                    return []
        
        return []

    def build_network(self, papers: List[Union[Paper, Dict]]) -> NetworkData:
        """Build semantic network from papers."""
        try:
            nodes = []
            edges = []

            # Helper function to safely extract metadata
            def safe_extract(paper, field, default=''):
                if isinstance(paper, dict):
                    return paper.get(field, default)
                return getattr(paper, field, default)

            # Add paper nodes and concepts
            for paper in papers:
                # Normalize paper to ensure we have consistent access to attributes
                title = safe_extract(paper, 'title', f"Unnamed Paper {len(nodes)+1}")
                abstract = safe_extract(paper, 'abstract', '')
                authors = safe_extract(paper, 'authors', [])
                year = safe_extract(paper, 'year', None)

                # Generate unique paper ID
                paper_id = f"paper_{hashlib.md5(title.encode()).hexdigest()}"
                
                # Add paper node
                nodes.append(Node(
                    id=paper_id,
                    label=title,
                    type="paper",
                    metadata={
                        "authors": authors,
                        "year": year,
                        "abstract": abstract
                    },
                    score=1.0
                ))

                # Extract and add concept nodes
                try:
                    # Fallback to a simple extraction if _extract_concepts fails
                    concepts = self._extract_concepts(abstract) if abstract else []
                except Exception as concept_error:
                    print(f"Concept extraction error for paper {title}: {concept_error}")
                    concepts = []

                # Track unique concepts to avoid duplicates
                unique_concepts = set()
                
                for concept in concepts:
                    # Normalize concept
                    concept = concept.lower().strip()
                    if not concept or concept in unique_concepts:
                        continue
                    
                    unique_concepts.add(concept)
                    
                    # Generate unique concept ID
                    concept_id = f"concept_{hashlib.md5(concept.encode()).hexdigest()}"
                    
                    # Add concept node
                    nodes.append(Node(
                        id=concept_id,
                        label=concept,
                        type="concept",
                        metadata={},
                        score=0.5
                    ))

                    # Connect paper to concept
                    edges.append(Edge(
                        source=paper_id,
                        target=concept_id,
                        type="contains",
                        weight=1.0,
                        metadata={}
                    ))

                # Analyze concept relationships
                try:
                    relationships = self._analyze_concept_relationships(list(unique_concepts), abstract)
                    for rel in relationships:
                        source_id = f"concept_{hashlib.md5(rel['source'].lower().encode()).hexdigest()}"
                        target_id = f"concept_{hashlib.md5(rel['target'].lower().encode()).hexdigest()}"
                        
                        edges.append(Edge(
                            source=source_id,
                            target=target_id,
                            type=rel.get('type', 'related'),
                            weight=rel.get('weight', 0.5),
                            metadata={}
                        ))
                except Exception as rel_error:
                    print(f"Relationship analysis error: {rel_error}")

            # Remove duplicate nodes and edges
            unique_nodes = {node.id: node for node in nodes}.values()
            unique_edges = []
            edge_keys = set()

            for edge in edges:
                edge_key = (edge.source, edge.target, edge.type)
                if edge_key not in edge_keys:
                    unique_edges.append(edge)
                    edge_keys.add(edge_key)

            return NetworkData(
                nodes=list(unique_nodes), 
                edges=unique_edges
            )
        
        except Exception as e:
            print(f"Error during network generation: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Unexpected error during network generation: {str(e)}"
            )