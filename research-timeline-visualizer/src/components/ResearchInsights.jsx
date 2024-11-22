import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Lightbulb, Layers, Search } from 'lucide-react';

const PaperReference = ({ papers, number }) => {
  const paperIndex = number - 1;
  const paper = papers[paperIndex];

  if (!paper) return <span className="text-red-500">Paper {number}</span>;

  return (
    <span className="font-semibold text-blue-600 hover:underline cursor-help" title={paper.title}>
      Paper {number}
    </span>
  );
};

const ResearchInsights = ({ query, papers, insights, isLoading }) => {
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

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p>Loading research insights...</p>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="text-center py-8 bg-white rounded-lg shadow-md">
        <p className="text-gray-600">
          No research insights available. Try searching for a research topic above.
        </p>
      </div>
    );
  }

  const hasThematicInsights = insights?.thematic_insights?.insights;
  const hasComparativeInsights = insights?.comparative_insights?.insights;
  const hasMethodologicalInsights = insights?.methodological_insights?.insights;
  const hasTrendInsights = insights?.trend_insights?.insights;

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

export default ResearchInsights