import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { 
  Lightbulb, 
  Zap, 
  Globe, 
  FileQuestion, 
  AlertTriangle, 
  RefreshCw 
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const PredictiveResearchIntelligence = ({ papers, query }) => {
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Create a stable reference for the current papers and query
  const paperContextKey = useMemo(() => 
    papers?.map(p => p.title).join('|') + '|' + query, 
    [papers, query]
  );

  const generatePredictiveInsights = useCallback(async () => {
    // Reset state before new generation
    setInsights(null);
    setError(null);

    // Validate inputs
    if (!papers || papers.length === 0 || !query) {
      setError('Insufficient data for generating insights');
      return;
    }

    // Check local storage first to avoid regenerating
    const storedInsights = localStorage.getItem(paperContextKey);
    if (storedInsights) {
      setInsights(storedInsights);
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('http://127.0.0.1:8000/chat', {
        messages: [
          {
            role: 'system', 
            content: `You are an advanced research intelligence assistant specializing in analyzing research around the topic: "${query}". 
            Provide strategic, forward-looking insights that go beyond the current research landscape.`
          },
          {
            role: 'user',
            content: `Comprehensive Research Intelligence Analysis for "${query}":

Context:
- Total Papers Analyzed: ${papers.length}
- Search Query: ${query}

Research Papers Overview:
${papers.map((paper, index) => `
[Paper ${index + 1}]
- Title: ${paper.title}
- Authors: ${paper.authors?.join(', ') || 'N/A'}
- Publication Date: ${paper.publication_date}
- Citations: ${paper.citations || 0}
- Venue: ${paper.venue || 'Unknown'}
`).join('\n')}

Advanced Analysis Objectives:
1. Identify Critical Research Gaps in "${query}"
   - What key questions remain unanswered?
   - Where are the most significant unexplored areas?

2. Interdisciplinary Research Opportunities
   - What unexpected connections can be drawn?
   - How might insights from other fields apply?

3. Emerging Research Trajectories
   - Predict potential breakthrough directions
   - Suggest novel methodological approaches
   - Highlight transformative research potential

4. Strategic Recommendations
   - Concrete, actionable research suggestions
   - Potential funding or collaboration opportunities
   - Long-term research strategy insights`
          }
        ],
        context: {
          papers: papers,
          analysisMode: 'Predictive Insights'
        }
      }, {
        timeout: 45000, // 45-second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.response) {
        const generatedInsights = response.data.response;
        
        // Store insights in local storage
        localStorage.setItem(paperContextKey, generatedInsights);
        
        setInsights(generatedInsights);
        setRetryCount(0); // Reset retry count on successful generation
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Insight generation error:', err);
      
      // Implement retry mechanism
      if (retryCount < 2) {
        setError(`Generation attempt failed. Retrying... (${retryCount + 1}/3)`);
        setRetryCount(prev => prev + 1);
        
        // Delay before retry
        setTimeout(generatePredictiveInsights, 2000);
      } else {
        setError(
          err.response?.data?.detail || 
          err.message || 
          'Failed to generate predictive insights. Please try again.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [papers, query, paperContextKey, retryCount]);

  useEffect(() => {
    // Only generate insights if not already in local storage
    const storedInsights = localStorage.getItem(paperContextKey);
    if (!storedInsights) {
      generatePredictiveInsights();
    } else {
      setInsights(storedInsights);
    }
  }, [paperContextKey, generatePredictiveInsights]);
  
  // Render methods
  const renderNoDataState = () => (
    <div className="p-6 bg-gray-50 rounded-lg text-center">
      <FileQuestion className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <p className="text-gray-600">
        {!query 
          ? 'Enter a search query to generate research intelligence' 
          : 'Perform a search to generate predictive research intelligence'}
      </p>
    </div>
  );

  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center space-y-4 p-6 bg-blue-50 rounded-lg">
      <div className="flex items-center space-x-3 text-blue-500">
        <Zap className="animate-pulse h-8 w-8" />
        <p className="text-blue-700 font-medium">
          {retryCount > 0 
            ? `Retrying insight generation (${retryCount}/3)...` 
            : 'Generating advanced research insights...'}
        </p>
      </div>
      <p className="text-sm text-blue-600 text-center">
        Analyzing {papers.length} research papers for "{query}"
      </p>
    </div>
  );

  const renderErrorState = () => (
    <div className="bg-red-50 border border-red-200 p-6 rounded-lg flex items-center space-x-4">
      <AlertTriangle className="h-10 w-10 text-red-500" />
      <div>
        <p className="text-red-700 font-semibold">Insight Generation Failed</p>
        <p className="text-red-600 text-sm">{error}</p>
        <button 
          onClick={generatePredictiveInsights}
          className="mt-2 flex items-center space-x-2 bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Retry</span>
        </button>
      </div>
    </div>
  );

  const renderInsightsState = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
        <div className="flex items-center mb-2">
          <Globe className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="font-semibold text-blue-800">Predictive Research Insights</h3>
        </div>
        <ReactMarkdown 
          components={{
            h2: ({node, ...props}) => <h2 className="text-xl font-semibold mb-2 text-blue-700" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-lg font-medium mb-1 text-blue-600" {...props} />,
            strong: ({node, ...props}) => <strong className="font-bold text-blue-800" {...props} />,
            p: ({node, ...props}) => <p className="mb-2 text-gray-700" {...props} />,
            ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-2" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-2" {...props} />,
            li: ({node, ...props}) => <li className="mb-1" {...props} />,
            a: ({node, ...props}) => <a className="text-blue-500 hover:underline" {...props} />
          }}
          className="prose max-w-none"
        >
          {insights}
        </ReactMarkdown>
      </div>
    </div>
  );

  // Main render logic
  if (!papers || papers.length === 0 || !query) {
    return renderNoDataState();
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <div className="flex items-center mb-6">
        <Lightbulb className="h-8 w-8 text-blue-500 mr-4" />
        <h2 className="text-2xl font-bold text-gray-800">
          Predictive Research Intelligence
        </h2>
      </div>

      {isLoading 
        ? renderLoadingState() 
        : error 
        ? renderErrorState() 
        : renderInsightsState()}
    </div>
  );
};

export default PredictiveResearchIntelligence;