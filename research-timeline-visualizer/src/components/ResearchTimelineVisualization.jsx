import React, { useMemo } from 'react';
import { ExternalLink, Calendar, Users, BookOpen, ArrowUpRight } from 'lucide-react';

const PaperCard = ({ paper, isLeft }) => (
  <div className={`w-5/12 ${isLeft ? 'pr-8' : 'pl-8'}`}>
    <div className="bg-white rounded-lg shadow-lg p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-gray-100">
      {/* Title with Link */}
      <div className="group">
        <a 
          href={paper.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors"
        >
          <h3 className="line-clamp-2">{paper.title}</h3>
          <ArrowUpRight className="opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
        </a>
      </div>

      {/* Metadata Section */}
      <div className="mt-4 space-y-2 text-sm text-gray-600">
        {paper.publication_date && (
          <div className="flex items-center gap-2">
            <Calendar size={16} />
            <span>
              {new Date(paper.publication_date).getFullYear().toString().slice(-4)} {/* Display only the last 4 characters of the year */}
            </span>
          </div>
        )}
        
        {paper.authors && paper.authors.length > 0 && (
          <div className="flex items-center gap-2">
            <Users size={16} />
            <span className="line-clamp-1">{paper.authors.join(', ')}</span>
          </div>
        )}
        
        {paper.citations !== undefined && (
          <div className="flex items-center gap-2">
            <BookOpen size={16} />
            <span className="inline-flex items-center bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full">
              {paper.citations} citations
            </span>
          </div>
        )}
      </div>

      {/* Relevance Badge - if this is the queried paper */}
      {paper.isQueried && (
        <div className="absolute -top-2 -right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
          Latest Research
        </div>
      )}
    </div>
  </div>
);

const ResearchTimelineVisualization = ({ papers, searchQuery }) => {
  // Sort papers by date (oldest first) and mark the most relevant paper
  const sortedPapers = useMemo(() => {
    return [...papers]
      .sort((a, b) => new Date(a.publication_date) - new Date(b.publication_date)) // Ensure chronological order (oldest first)
      .map((paper, index) => ({
        ...paper,
      }));
  }, [papers]);

  return (
    <div className="relative w-full min-h-screen bg-gray-50 py-12">
      {/* Timeline line */}
      <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-500 to-blue-100" />
      
      {/* Search Query Header */}
      {searchQuery && (
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800">
            Research Timeline
          </h2>
          <p className="text-gray-600 mt-2">
            Showing results for: "{searchQuery}"
          </p>
        </div>
      )}

      {/* Timeline Items */}
      <div className="relative w-full">
        {sortedPapers.map((paper, index) => (
          <div 
            key={paper.title} 
            className={`mb-16 flex justify-center items-center w-full ${
              index % 2 === 0 ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Timeline dot with pulse effect for queried paper */}
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center">
              <div className={`w-4 h-4 rounded-full ${
                paper.isQueried 
                  ? 'bg-blue-500 animate-pulse' 
                  : 'bg-blue-300'
              } border-4 border-white z-20`} />
              {paper.isQueried && (
                <div className="absolute w-6 h-6 rounded-full bg-blue-500 opacity-50 animate-ping" />
              )}
            </div>

            {/* Paper Card */}
            {(paper.title && (paper.publication_date || paper.authors)) && (
              <PaperCard paper={paper} isLeft={index % 2 === 0} />
            )}

            {/* Date marker */}
            <div className={`w-5/12 flex ${
              index % 2 === 0 ? 'justify-start pl-8' : 'justify-end pr-8'
            }`}>
              {paper.publication_date && (
                <div className="text-lg font-semibold text-gray-600">
                  {new Date(paper.publication_date).getFullYear().toString().slice(-4)} {/* Display only the last 4 characters of the year */}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResearchTimelineVisualization;
