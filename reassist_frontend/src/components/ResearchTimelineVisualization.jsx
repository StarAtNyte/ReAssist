import React, { useMemo } from 'react';
import { Calendar, Users, BookOpen, ArrowUpRight } from 'lucide-react';

const PaperCard = ({ paper, isLeft }) => (
  <div className={`w-5/12 ${isLeft ? 'pr-10' : 'pl-10'} transition-all duration-500`}>
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-2xl group">
      <div className="group">
        <a 
          href={paper.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors"
        >
          <h3 className="line-clamp-2 flex-grow">{paper.title}</h3>
          <ArrowUpRight 
            className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" 
            size={24} 
          />
        </a>
      </div>

      <div className="mt-5 space-y-3 text-sm text-gray-600">
        {paper.publication_date && (
          <div className="flex items-center gap-3">
            <Calendar size={18} className="text-blue-500" />
            <span className="font-medium">
              {new Date(paper.publication_date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        )}
        
        {paper.authors && paper.authors.length > 0 && (
          <div className="flex items-center gap-3">
            <Users size={18} className="text-green-500" />
            <span className="line-clamp-2 italic">
              {paper.authors.join(', ')}
            </span>
          </div>
        )}
      </div>
    </div>
  </div>
);

const ResearchTimelineVisualization = ({ papers }) => {
  const sortedPapers = useMemo(() => {
    return [...papers]
      .sort((a, b) => new Date(a.publication_date) - new Date(b.publication_date));
  }, [papers]);

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-16 pb-28">
      <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1.5 bg-gradient-to-b from-blue-500 to-blue-100 shadow-md" />
      
      <div className="relative w-full max-w-6xl mx-auto px-4">
        {sortedPapers.map((paper, index) => (
          <div 
            key={paper.id || paper.title}
            className={`mb-16 flex justify-center items-center w-full 
              ${index % 2 === 0 ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center">
              <div className={`w-5 h-5 rounded-full bg-blue-500 
                border-4 border-white z-20 animate-pulse`} 
              />
            </div>

            <PaperCard 
              paper={paper} 
              isLeft={index % 2 === 0}
            />                  

            <div className={`w-5/12 flex ${
              index % 2 === 0 ? 'justify-start' : 'justify-end'
            }`}>
              {paper.publication_date && (
                <div className="text-xl font-bold text-blue-600">
                  {new Date(paper.publication_date).getFullYear()}
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