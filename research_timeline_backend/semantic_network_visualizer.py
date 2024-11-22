import networkx as nx
import matplotlib.pyplot as plt
import json
from typing import List, Dict, Any
import openai
import os
from dotenv import load_dotenv
import logging
import traceback

load_dotenv()

class SemanticNetworkVisualizer:
    def __init__(self, api_key=None):
        """
        Initialize the Semantic Network Visualizer with error handling
        """
        try:
            api_key = api_key or os.environ.get("SAMBANOVA_API_KEY")
            
            if not api_key:
                raise ValueError("No API key provided. Set SAMBANOVA_API_KEY in .env")
            
            self.client = openai.OpenAI(
                api_key=api_key,
                base_url="https://api.sambanova.ai/v1"
            )
            self.graph = nx.DiGraph()
            
            logging.basicConfig(level=logging.INFO)
            self.logger = logging.getLogger(__name__)
        
        except Exception as e:
            self.logger.error(f"Initialization error: {e}")
            raise

    def _validate_papers(self, papers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Validate and clean input papers with more comprehensive validation
        """
        if not papers or not isinstance(papers, list):
            raise ValueError("Input must be a non-empty list of papers")
        
        validated_papers = []
        for paper in papers:
            if not isinstance(paper, dict):
                self.logger.warning(f"Skipping invalid paper: {paper}")
                continue
            
            cleaned_paper = {
                'title': paper.get('title', 'Untitled'),
                'abstract': paper.get('abstract', ''),
                'id': paper.get('id', str(hash(paper.get('title', ''))))
            }
            
            if not cleaned_paper['title'] or len(cleaned_paper['title']) < 3:
                self.logger.warning(f"Skipping paper with invalid title: {cleaned_paper}")
                continue
            
            validated_papers.append(cleaned_paper)
        
        return validated_papers

    def build_knowledge_graph(self, papers: List[Dict[str, Any]]) -> nx.DiGraph:
        """
        Build a knowledge graph with enhanced error handling
        """
        try:
            self.graph.clear()
            
            validated_papers = self._validate_papers(papers)
            
            if not validated_papers:
                return nx.DiGraph()
            
            for paper in validated_papers:
                self.graph.add_node(
                    paper['title'], 
                    attributes=paper
                )
            
            connections_result = self.extract_semantic_connections(validated_papers)
            
            if connections_result and 'connections' in connections_result:
                for connection in connections_result['connections']:
                    source = connection.get('source_paper')
                    target = connection.get('target_paper')
                    relationship = connection.get('relationship', 'related')
                    
                    if (source and target and 
                        source in self.graph.nodes and 
                        target in self.graph.nodes):
                        self.graph.add_edge(source, target, type=relationship)
            
            return self.graph
        
        except Exception as e:
            self.logger.error(f"Knowledge graph build error: {e}")
            return nx.DiGraph()  

    def extract_semantic_connections(self, papers: List[Dict[str, Any]]) -> Dict[str, Any]:
        try:
            validated_papers = self._validate_papers(papers)
            
            if not validated_papers:
                self.logger.warning("No valid papers provided for semantic connection extraction")
                return {"connections": [], "error": "No valid papers provided"}
            
            prompt = "Analyze the following research papers and identify semantic connections:\n\n"
            for paper in validated_papers:
                prompt += f"Title: {paper['title']}\n"
                prompt += f"Abstract: {paper.get('abstract', 'No abstract available')}\n\n"
            
            prompt += """
            For each pair of papers, identify:
            1. Shared concepts
            2. Complementary research directions
            3. Potential connections
            
            Provide a response with connections between papers.
            """
            
            try:
                response = self.client.chat.completions.create(
                    model="Meta-Llama-3.1-405B-Instruct",
                    messages=[
                        {"role": "system", "content": "You are an expert research connection analyzer."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.2,
                    max_tokens=1500
                )
                
              
                if not hasattr(response, 'choices') or not response.choices:
                    self.logger.error("No valid choices in model response")
                    self.logger.error(f"Response details: {response}")
                    return {"connections": [], "error": "No valid model response"}
                
                content = response.choices[0].message.content
                
                connections = self._parse_connections(content, validated_papers)
                
                return {
                    "connections": connections,
                    "error": None
                }
            
            except Exception as api_error:
                self.logger.error(f"Connection extraction API error: {api_error}")
                import traceback
                self.logger.error(traceback.format_exc())
                return {
                    "connections": [], 
                    "error": f"API Error: {str(api_error)}"
                }
        
        except Exception as e:
            self.logger.error(f"Comprehensive error in connection extraction: {e}")
            import traceback
            self.logger.error(traceback.format_exc())
            return {"connections": [], "error": str(e)}

    def _parse_connections(self, content: str, papers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Manually parse connections from model response
        """
        connections = []
        
        for i in range(len(papers)):
            for j in range(i+1, len(papers)):
                paper1 = papers[i]
                paper2 = papers[j]
                
                connection_keywords = [
                    "shared", "related", "similar", "complementary", 
                    "builds upon", "extends", "inspired by"
                ]
                
                for keyword in connection_keywords:
                    if keyword in content.lower():
                        connections.append({
                            "source_paper": paper1['title'],
                            "target_paper": paper2['title'],
                            "relationship": keyword
                        })
                        break
        
        return connections
    
    def identify_contradictions(self, papers: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Identify potential contradictions with comprehensive error handling
        """
        try:
            validated_papers = self._validate_papers(papers)
            
            if not validated_papers:
                return {"contradictions": [], "error": "No valid papers provided"}
            
            prompt = "Carefully analyze these research papers for potential contradictions:\n\n"
            for paper in validated_papers:
                prompt += f"Title: {paper['title']}\n"
                prompt += f"Abstract: {paper.get('abstract', 'No abstract')}\n\n"
            
            prompt += """
            Identify nuanced contradictions, focusing on:
            1. Conflicting methodological approaches
            2. Opposing theoretical frameworks
            3. Contradictory empirical findings
            
            Provide a detailed analysis with clear explanations.
            """
            
            try:
                response = self.client.chat.completions.create(
                    model="Meta-Llama-3.1-405B-Instruct",
                    messages=[
                        {"role": "system", "content": "You are an expert research contradiction analyzer."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.2,
                    max_tokens=1000
                )
                
               
                content = response.choices[0].message.content if response.choices else ""
                
                contradictions = self._parse_contradictions(content, validated_papers)
                
                return {
                    "contradictions": contradictions,
                    "error": None if contradictions else "No contradictions found"
                }
            
            except Exception as api_error:
                self.logger.error(f"Contradiction analysis API error: {api_error}")
                import traceback
                self.logger.error(traceback.format_exc())
                return {
                    "contradictions": [], 
                    "error": f"API Error: {str(api_error)}"
                }
        
        except Exception as e:
            self.logger.error(f"Comprehensive error in contradiction identification: {e}")
            import traceback
            self.logger.error(traceback.format_exc())
            return {
                "contradictions": [], 
                "error": str(e)
            }

    def _parse_contradictions(self, content: str, papers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Manually parse contradictions from model response with deduplication
        """
        contradictions = []
        contradiction_set = set()  
        
        for i in range(len(papers)):
            for j in range(i+1, len(papers)):
                paper1 = papers[i]
                paper2 = papers[j]
                
                contradiction_keywords = [
                    "conflict", "contradict", "opposing", "disagree", 
                    "contrary", "inconsistent", "divergent"
                ]
                
                for keyword in contradiction_keywords:
                    if keyword in content.lower():
                        contradiction_key = (paper1['title'], paper2['title'])
                        
                        if contradiction_key not in contradiction_set:
                            contradiction = {
                                "source_paper": paper1['title'],
                                "target_paper": paper2['title'],
                                "description": f"Potential contradiction detected based on {keyword}"
                            }
                            contradictions.append(contradiction)
                            contradiction_set.add(contradiction_key)
                            break
        
        return contradictions

    def visualize_knowledge_graph(self, output_path='semantic_network.png'):
        """
        Visualize the knowledge graph
        """
        try:
            plt.figure(figsize=(12, 8))
            pos = nx.spring_layout(self.graph)
            nx.draw(
                self.graph, 
                pos, 
                with_labels=True, 
                node_color='lightblue', 
                node_size=300, 
                font_size=8, 
                font_weight='bold'
            )
            plt.title("Semantic Network of Research Papers")
            plt.tight_layout()
            plt.savefig(output_path)
            plt.close()
            return output_path
        except Exception as e:
            self.logger.error(f"Graph visualization error: {e}")
            return None