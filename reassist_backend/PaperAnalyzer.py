
from typing import List, Dict
from fastapi import  HTTPException
import asyncio

class PaperAnalyzer:
    def __init__(self, openai_client):
        self.client = openai_client
        self.analysis_strategies = {
            'Overview': self._generate_overview,
            'Visual Summary': self._generate_visual_summary,
            'Figure Extraction': self._extract_figures,
            'Key Insights': self._extract_key_insights,
            'Citation Analysis': self._analyze_citations,
            'Comparative Analysis': self._comparative_analysis,
            'Predictive Insights': self._generate_predictive_insights  # Added new mode
        }

    async def analyze_papers(self, papers: List[Dict], analysis_mode: str) -> str:
        """
        Analyze papers based on the selected analysis mode
        
        :param papers: List of paper dictionaries
        :param analysis_mode: Specific analysis mode to apply
        :return: Detailed analysis response
        """
        try:
            if analysis_mode not in self.analysis_strategies:
                raise ValueError(f"Unsupported analysis mode: {analysis_mode}")

            analysis_method = self.analysis_strategies[analysis_mode]
            
            return await analysis_method(papers)
        
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    async def _generate_predictive_insights(self, papers: List[Dict]) -> str:
        """
        Generate forward-looking, strategic research intelligence
        """
        publication_years = [p.get('publication_date', '').split('-')[0] for p in papers if p.get('publication_date')]
        venues = [p.get('venue', 'Unknown') for p in papers]
        citation_counts = [p.get('citations', 0) for p in papers]
        
        domains = set()
        for paper in papers:
            title_words = paper.get('title', '').lower().split()
            venue = paper.get('venue', '').lower()
            domains.update([word for word in title_words if len(word) > 3])
            domains.add(venue)
        
        prompt = f"""
        Advanced Predictive Research Intelligence Analysis

        Research Landscape Overview:
        - Total Papers Analyzed: {len(papers)}
        - Publication Year Range: {min(publication_years)} - {max(publication_years)}
        - Publication Venues: {', '.join(set(venues))}
        - Citation Metrics: 
          * Min Citations: {min(citation_counts)}
          * Max Citations: {max(citation_counts)}
          * Average Citations: {sum(citation_counts) / len(citation_counts):.2f}
        - Identified Research Domains: {', '.join(list(domains)[:10])}

        Comprehensive Predictive Analysis Framework:

        1. Critical Research Gaps and Opportunities
        - Identify systematic blind spots in current research
        - Highlight underexplored theoretical and methodological approaches
        - Pinpoint areas ripe for breakthrough innovations

        2. Interdisciplinary Research Potential
        - Discover unexpected cross-domain connections
        - Propose novel research methodologies that transcend traditional boundaries
        - Suggest collaborative research strategies

        3. Emerging Research Trajectories
        - Extrapolate current research trends
        - Predict potential paradigm shifts
        - Identify technologies or methodologies likely to disrupt the field
        - Forecast research directions based on current publication patterns

        4. Strategic Research Recommendations
        - Concrete, actionable research suggestions
        - Potential funding or collaboration opportunities
        - Long-term research strategy insights
        - Risk and opportunity assessment

        Context Papers:
        {chr(10).join([
            f"Title: {p.get('title', 'Untitled')}\n"
            f"Authors: {', '.join(p.get('authors', []))}\n"
            f"Publication Date: {p.get('publication_date', 'Unknown')}"
            for p in papers
        ])}

        Approach the analysis with:
        - Scientific rigor
        - Creative thinking
        - Forward-looking perspective
        - Nuanced understanding of research dynamics
        """
        
        return await self._generate_llm_response(prompt, papers[0] if papers else {})

    async def analyze_papers(self, papers: List[Dict], analysis_mode: str) -> str:
        """
        Analyze papers based on the selected analysis mode
        
        :param papers: List of paper dictionaries
        :param analysis_mode: Specific analysis mode to apply
        :return: Detailed analysis response
        """
        try:
            if analysis_mode not in self.analysis_strategies:
                raise ValueError(f"Unsupported analysis mode: {analysis_mode}")

            analysis_method = self.analysis_strategies[analysis_mode]
            
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
        - Give Figures extensively

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
    
    async def _generate_llm_response(self, prompt: str, paper: Dict, max_tokens: int = 1500) -> str:
        """
        Generate a more detailed response using full paper context
        
        :param prompt: Analysis prompt
        :param paper: Full paper details from Semantic Scholar
        :param max_tokens: Maximum token limit for response
        :return: Detailed analysis response
        """
        try:
            paper_context = f"""
            Paper Details:
            - Title: {paper.get('title', 'N/A')}
            - Authors: {', '.join(paper.get('authors', []))}
            - Publication Date: {paper.get('publication_date', 'N/A')}
            - Abstract: {paper.get('abstract', 'No abstract available')}
            - Citations: {paper.get('citations', 0)}
            - Link: {paper.get('link', 'No link available')}
            
            Additional Metadata:
            - Venue: {paper.get('venue', 'Unknown')}
            - DOI: {paper.get('doi', 'N/A')}
            """
            
            full_prompt = f"{paper_context}\n\nAnalysis Task:\n{prompt}"
            
            response = await asyncio.to_thread(
                self.client.chat.completions.create,
                model="Llama-3.2-11B-Vision-Instruct",
                messages=[
                    {
                        "role": "system", 
                        "content": "You are a sophisticated research analysis assistant. Provide detailed, insightful analysis based on the given paper context."
                    },
                    {"role": "user", "content": full_prompt}
                ],
                temperature=0.2,
                max_tokens=max_tokens
            )
            
            return response.choices[0].message.content
        
        except Exception as e:
            return f"Analysis generation error: {str(e)}"