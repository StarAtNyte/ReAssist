import React from 'react';

const PaperRecommendations = ({ papers, isLoading }) => {
  if (isLoading) {
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
          No papers found. Try searching for a research topic above.
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

export default PaperRecommendations;