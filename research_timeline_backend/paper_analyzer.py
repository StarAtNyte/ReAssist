import openai
from typing import List, Dict, Any
from models import Paper

class ReviewPaperAnalyzer:
    def __init__(self, client):
        self.client = client

    async def analyze_papers(self, papers: List[Paper], mode: str = "thematic") -> Dict[str, Any]:
        """Analyze a list of papers with different modes"""
        if not papers:
            return {"error": "No papers provided for analysis"}

        analysis_modes = {
            "thematic": self._thematic_analysis,
            "comparative": self._comparative_analysis,
            "methodological": self._methodological_analysis,
            "comprehensive": self._comprehensive_analysis
        }

        try:
            analysis_func = analysis_modes.get(mode, self._thematic_analysis)
            return await analysis_func(papers)
        except Exception as e:
            return {
                "error": f"Analysis failed: {str(e)}",
                "mode": mode
            }

    async def _prepare_paper_context(self, papers: List[Paper]) -> str:
        """Prepare a structured context from papers for analysis"""
        context_parts = []
        for i, paper in enumerate(papers, 1):
            context = (
                f"Paper {i} Details:\n"
                f"- Title: {paper.title or 'Untitled'}\n"
                f"- Authors: {', '.join(paper.authors) if paper.authors else 'Unknown'}\n"
                f"- Publication Year: {paper.publication_date or 'N/A'}"
            )
            context_parts.append(context)
        
        return "\n\n".join(context_parts)

    async def _thematic_analysis(self, papers: List[Paper]) -> Dict:
        """Extract comprehensive thematic insights"""
        context = await self._prepare_paper_context(papers)
        
        response = self.client.chat.completions.create(
            model="Llama-3.2-11B-Vision-Instruct",
            messages=[
                {"role": "system", "content": "You are an expert research theme extraction analyst."},
                {"role": "user", "content": f"""
                Analyze the research papers and extract comprehensive thematic insights following this structured format:

                **Emerging Research Themes:**
                1. Theme Name: Brief description of the theme, its significance, and emerging trends.
                2. Theme Name: Brief description of the theme, its significance, and emerging trends.

                **Conceptual Patterns:**
                1. Pattern Name: Description of how this conceptual pattern manifests in current research.
                2. Pattern Name: Description of how this conceptual pattern manifests in current research.

                **Interconnected Research Domains:**
                1. Domain Interaction: Describe how different research domains are intersecting and influencing each other.
                2. Domain Interaction: Describe how different research domains are intersecting and influencing each other.

                **Nuanced Thematic Relationships:**
                1. Relationship Description: Explain the subtle interconnections between different research themes and approaches.
                2. Relationship Description: Explain the subtle interconnections between different research themes and approaches.

                Papers to analyze:
                {context}
                
                Provide a comprehensive, structured analysis that reveals deep insights into current research trends.
                """}
            ],
            temperature=0.3
        )
        
        return {
            "analysis_type": "thematic",
            "insights": response.choices[0].message.content
        }

    async def _comparative_analysis(self, papers: List[Paper]) -> Dict:
        """Compare methodological approaches and contributions"""
        context = await self._prepare_paper_context(papers)
        
        response = self.client.chat.completions.create(
            model="Llama-3.2-11B-Vision-Instruct",  
            messages=[
                {
                    "role": "system", 
                    "content": "You are an advanced comparative research analyst."
                },
                {
                    "role": "user", 
                    "content": f"""
                    Perform a structured comparative analysis of the research papers:

                    **Methodological Comparisons:**
                    1. Research Approach: Compare and contrast research methodologies
                    2. Innovation Assessment: Evaluate unique methodological contributions

                    **Findings Comparison:**
                    1. Key Insights: Compare primary findings across papers
                    2. Divergence Points: Identify significant differences in research outcomes

                    **Complementary Insights:**
                    1. Synergistic Elements: Highlight how different approaches complement each other
                    2. Potential Integration Strategies: Suggest ways methodologies could be combined

                    **Research Gaps and Opportunities:**
                    1. Unexplored Areas: Identify methodological gaps
                    2. Future Research Directions: Propose potential research strategies

                    Papers to analyze:
                    {context}
                    """}
            ],
            temperature=0.3
        )
        
        return {
            "analysis_type": "comparative",
            "insights": response.choices[0].message.content
        }

    async def _methodological_analysis(self, papers: List[Paper]) -> Dict:
        """Evaluate research methodologies in depth"""
        context = await self._prepare_paper_context(papers)
        
        response = self.client.chat.completions.create(
            model="Llama-3.2-11B-Vision-Instruct",
            messages=[
                {"role": "system", "content": "You are a methodological research assessment expert."},
                {"role": "user", "content": f"""
                Conduct a comprehensive methodological analysis:

                **Research Design Assessment:**
                1. Methodology Type: Description and critical evaluation
                2. Methodology Strengths: Detailed analysis of methodological advantages

                **Innovative Techniques:**
                1. Novel Approach: Description of unique methodological innovations
                2. Potential Impact: Assessment of the innovation's significance

                **Methodological Limitations:**
                1. Constraint Identification: Describe potential methodological constraints
                2. Mitigation Strategies: Propose ways to address limitations

                **Cross-Disciplinary Methodological Insights:**
                1. Interdisciplinary Techniques: How methodologies might apply across domains
                2. Transferability Assessment: Evaluate method's adaptability

                Papers to analyze:
                {context}
                """}
            ],
            temperature=0.3
        )
        
        return {
            "analysis_type": "methodological",
            "insights": response.choices[0].message.content
        }

    async def _comprehensive_analysis(self, papers: List[Paper]) -> Dict:
        """Perform a holistic multi-dimensional research analysis"""
        context = await self._prepare_paper_context(papers)
        
        response = self.client.chat.completions.create(
            model="Llama-3.2-11B-Vision-Instruct",
            messages=[
                {"role": "system", "content": "You are an advanced research synthesis expert."},
                {"role": "user", "content": f"""
                Provide a comprehensive, multi-dimensional research analysis with the following structure:

                **Emerging Research Landscape:**
                1. Dominant Research Themes
                2. Paradigm Shifts

                **Methodological Innovations:**
                1. Cutting-edge Research Approaches
                2. Technological Advancements

                **Interdisciplinary Convergence:**
                1. Cross-domain Research Interactions
                2. Emerging Collaborative Frameworks

                **Future Research Trajectory:**
                1. Predicted Research Directions
                2. Potential Breakthrough Areas

                Papers to analyze:
                {context}
                """}
            ],
            temperature=0.3
        )

        return {
            "analysis_type": "comprehensive",
            "insights": response.choices[0].message.content
        }