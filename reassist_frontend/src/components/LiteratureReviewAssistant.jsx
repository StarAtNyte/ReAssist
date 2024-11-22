import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { Book, FileText, Lightbulb, Layers, Search } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip/Tooltip.tsx';

const PaperReference = ({ papers, number }) => {
  const paperIndex = number - 1;
  const paper = papers[paperIndex];

  if (!paper) return <span className="text-red-500">Paper {number}</span>;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <span className="font-semibold text-blue-600 hover:underline cursor-help">
            Paper {number}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" align="start" className="max-w-xs">
          <div className="text-sm">
            <p className="font-bold">{paper.title}</p>
            <p className="text-gray-600">
              Authors: {paper.authors?.join(', ') || 'N/A'}
            </p>
            <p className="text-gray-600">
              Published: {paper.publication_date}
            </p>
            <p className="text-gray-600">
              Citations: {paper.citations || 0}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};


const LiteratureReviewAssistant = ({ query, papers: initialPapers = [] }) => {
  const [researchQuery, setResearchQuery] = useState(query || '');
  const [isPapersLoading, setIsPapersLoading] = useState(false);
  const [papers, setPapers] = useState(initialPapers);
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeView, setActiveView] = useState('recommendations');

  useEffect(() => {
    // Update research query and papers when props change
    setResearchQuery(query);
    setPapers(initialPapers);
  }, [query, initialPapers]);

  const fetchPapers = async () => {
    if (!researchQuery) return;
  
    setIsPapersLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/research/recommend', {
        topic: researchQuery,
        research_depth: 'comprehensive'
      });
  
      setPapers(response.data.papers);
    } catch (error) {
      console.error('Error fetching papers:', error);
    } finally {
      setIsPapersLoading(false);
    }
  };

  const fetchInsights = async () => {
    if (!researchQuery) return;

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/research/analyze', {
        topic: researchQuery,
        research_depth: 'comprehensive'
      });

      setInsights(response.data);
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (researchQuery && !initialPapers.length) {
      fetchPapers();
    }
  }, [researchQuery]);

  useEffect(() => {
    if (activeView === 'insights' && (!insights || insights.length === 0)) {
      fetchInsights();
    }
  }, [activeView, researchQuery]);

  const renderPapers = () => {
    if (isPapersLoading) {
      return (
        <div className="text-center py-8">
          <p>Loading paper recommendations...</p>
        </div>
      );
    }
  
    if (papers.length === 0) {
      return (
        <div className="text-center py-8 bg-white rounded-lg shadow-md">
          <p className="text-gray-600">
            No papers found. Try adjusting your research query or check your connection.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {papers.map((paper, index) => (
          <div 
            key={index} 
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h3 className="font-bold text-lg mb-2 line-clamp-2">{paper.title}</h3>
            <div className="text-sm text-gray-600 mb-2">
              <p>Authors: {paper.authors?.slice(0, 3).join(', ')}{paper.authors?.length > 3 ? '...' : ''}</p>
              <p>Year: {paper.publication_date}</p>
            </div>
            <p className="text-xs text-gray-500 line-clamp-3 mb-2">{paper.abstract}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-600">
                Citations: {paper.citations || 0}
              </span>
              <a 
                href={paper.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:underline"
              >
                View Paper
              </a>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderInsights = () => {
    const customRenderers = {
      text: ({ node, ...props }) => {
        const text = node.value;
        const paperReferenceRegex = /Papers?\s+(\d+(?:\s*,\s*\d+)*)/gi;
        
        const parts = text.split(paperReferenceRegex);
        
        return (
          <span>
            {parts.map((part, index) => {
              const match = text.match(paperReferenceRegex)?.[index / 2];
              if (match) {
                // Extract and render paper numbers
                const numbers = match
                  .replace(/Papers?\s*/i, '')
                  .split(/\s*,\s*/)
                  .map(num => parseInt(num.trim()));
                
                return (
                  <span key={index}>
                    {numbers.map((num, i) => (
                      <React.Fragment key={i}>
                        <PaperReference papers={papers} number={num} />
                        {i < numbers.length - 1 && ', '}
                      </React.Fragment>
                    ))}
                  </span>
                );
              }
              return part;
            })}
          </span>
        );
      }
    };

    // Log the full insights object for debugging
    console.log('Full insights object:', insights);
  
    // If no insights at all, show a general message
    if (!insights) {
      return (
        <div className="text-center py-8 bg-white rounded-lg shadow-md">
          <p className="text-gray-600">
            No research insights could be generated. 
            Please try a different research query or check your connection.
          </p>
        </div>
      );
    }
  
    // Check for specific insight types and their content
    const hasThematicInsights = insights?.thematic_insights?.insights;
    const hasComparativeInsights = insights?.comparative_insights?.insights;
    const hasMethodologicalInsights = insights?.methodological_insights?.insights;
    const hasTrendInsights = insights?.trend_insights?.insights;
  
    // If no specific insights are available
    if (!hasThematicInsights && !hasComparativeInsights && 
        !hasMethodologicalInsights && !hasTrendInsights) {
      return (
        <div className="text-center py-8 bg-white rounded-lg shadow-md">
          <p className="text-gray-600">
            Detailed research insights could not be extracted. 
            The research topic might be too narrow or too broad.
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {hasThematicInsights && (
          <div className="bg-white p-4 rounded-lg shadow-md prose max-w-none">
            <h3 className="font-bold text-lg mb-2 flex items-center">
              <Lightbulb className="mr-2 text-yellow-500" /> Thematic Insights
            </h3>
            <ReactMarkdown 
              components={{
                h2: ({node, ...props}) => <h2 className="text-xl font-semibold mb-2" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-lg font-medium mb-1" {...props} />,
                strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                p: ({node, ...props}) => <p className="mb-2" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-2" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-2" {...props} />,
                li: ({node, ...props}) => <li className="mb-1" {...props} />,
                ...customRenderers
              }}
            >
              {insights.thematic_insights.insights}
            </ReactMarkdown>
          </div>
        )}
        
        {hasComparativeInsights && (
          <div className="bg-white p-4 rounded-lg shadow-md prose max-w-none">
            <h3 className="font-bold text-lg mb-2 flex items-center">
              <Layers className="mr-2 text-green-500" /> Comparative Analysis
            </h3>
            <ReactMarkdown 
              components={{
                h2: ({node, ...props}) => <h2 className="text-xl font-semibold mb-2" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-lg font-medium mb-1" {...props} />,
                strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                p: ({node, ...props}) => <p className="mb-2" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-2" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-2" {...props} />,
                li: ({node, ...props}) => <li className="mb-1" {...props} />,
                ...customRenderers
              }}
            >
              {insights.comparative_insights.insights}
            </ReactMarkdown>
          </div>
        )}
  
        {hasMethodologicalInsights && (
          <div className="bg-white p-4 rounded-lg shadow-md prose max-w-none">
            <h3 className="font-bold text-lg mb-2 flex items-center">
              <Search className="mr-2 text-blue-500" /> Methodological Insights
            </h3>
            <ReactMarkdown 
              components={{
                h2: ({node, ...props}) => <h2 className="text-xl font-semibold mb-2" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-lg font-medium mb-1" {...props} />,
                strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                p: ({node, ...props}) => <p className="mb-2" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-2" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-2" {...props} />,
                li: ({node, ...props}) => <li className="mb-1" {...props} />,
                ...customRenderers
              }}
            >
              {insights.methodological_insights.insights}
            </ReactMarkdown>
          </div>
        )}
  
        {hasTrendInsights && (
          <div className="bg-white p-4 rounded-lg shadow-md prose max-w-none">
            <h3 className="font-bold text-lg mb-2 flex items-center">
              <Layers className="mr-2 text-purple-500" /> Research Trends
            </h3>
            <ReactMarkdown 
              components={{
                h2: ({node, ...props}) => <h2 className="text-xl font-semibold mb-2" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-lg font-medium mb-1" {...props} />,
                strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                p: ({node, ...props}) => <p className="mb-2" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-2" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-2" {...props} />,
                li: ({node, ...props}) => <li className="mb-1" {...props} />,
                ...customRenderers
              }}
            >
              {insights.trend_insights.insights}
            </ReactMarkdown>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="flex items-center mb-6 space-x-3">
        <Book className="text-blue-600 w-8 h-8" />
        <h2 className="text-2xl font-bold text-gray-800">Literature Review Assistant</h2>
      </div>

      <div className="flex space-x-4 mb-4">
        {[
          { name: 'recommendations', icon: FileText, label: 'Paper Recommendations' },
          { name: 'insights', icon: Lightbulb, label: 'Research Insights' }
        ].map((tab) => (
          <button
            key={tab.name}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
              activeView === tab.name 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setActiveView(tab.name)}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading research analysis...</p>
        </div>
      ) : (
        <div>
          {activeView === 'recommendations' ? renderPapers() : renderInsights()}
        </div>
      )}
    </div>
  );
};

export default LiteratureReviewAssistant;