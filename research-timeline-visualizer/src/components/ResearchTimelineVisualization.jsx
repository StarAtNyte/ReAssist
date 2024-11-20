import React, { useMemo } from 'react';
import { ExternalLink, Calendar, Users, BookOpen, ArrowUpRight, ChevronRight } from 'lucide-react';

const PaperCard = ({ paper, isLeft, onSelect, isSelected, isCollapsed }) => (
  <div 
    className={`w-5/12 ${isLeft ? 'pr-8' : 'pl-8'} cursor-pointer transition-all duration-500`}
    onClick={() => onSelect(paper)}
  >
    <div className={`bg-white rounded-lg shadow-lg transform transition-all duration-500 
      ${isCollapsed 
        ? 'p-2 hover:bg-gray-50' 
        : 'p-6 hover:shadow-xl'}
      ${isSelected ? 'ring-2 ring-blue-500' : 'border border-gray-100'}
    `}>
      {/* Collapsed View */}
      {isCollapsed ? (
        <div className="flex items-center gap-2 text-gray-600">
          <ChevronRight size={16} />
          <span className="text-sm font-medium truncate flex-1">{paper.title}</span>
          <span className="text-sm text-gray-400">
            {new Date(paper.publication_date).getFullYear()}
          </span>
        </div>
      ) : (
        <>
          {/* Expanded View */}
          <div className="group">
            <a 
              href={paper.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="line-clamp-2">{paper.title}</h3>
              <ArrowUpRight className="opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
            </a>
          </div>

          <div className="mt-4 space-y-2 text-sm text-gray-600">
            {paper.publication_date && (
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{new Date(paper.publication_date).getFullYear()}</span>
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

          {paper.isQueried && (
            <div className="absolute -top-2 -right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              Latest Research
            </div>
          )}
        </>
      )}
    </div>
  </div>
);

const ResearchTimelineVisualization = ({ 
  papers, 
  searchQuery, 
  onPaperSelect,
  selectedPaperId,
  isDropdownOpen,
  setIsDropdownOpen
}) => {
  const handlePaperSelect = (paper) => {
    if (selectedPaperId === paper.id) {
      onPaperSelect(null);
      setIsDropdownOpen(false);
    } else {
      onPaperSelect(paper);
      setIsDropdownOpen(true);
      
      setTimeout(() => {
        const element = document.getElementById(`paper-${paper.id}`);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }
      }, 100);
    }
  };

  const sortedPapers = useMemo(() => {
    return [...papers]
      .sort((a, b) => new Date(a.publication_date) - new Date(b.publication_date));
  }, [papers]);

  return (
    <div className="relative w-full min-h-screen bg-gray-50 py-12">
      <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-500 to-blue-100" />
      
      <div className="relative w-full">
        {sortedPapers.map((paper, index) => {
          const isSelected = paper.id === selectedPaperId;
          const isCollapsed = selectedPaperId && !isSelected;
          
          return (
            <div 
              key={paper.id || paper.title}
              id={`paper-${paper.id}`}
              className={`mb-8 flex justify-center items-center w-full 
                ${index % 2 === 0 ? 'flex-row-reverse' : 'flex-row'}
                transition-all duration-500
                ${isCollapsed ? 'mb-2' : 'mb-16'}`}
            >
              <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center">
                <div className={`w-4 h-4 rounded-full 
                  ${isSelected || paper.isQueried ? 'bg-blue-500 animate-pulse' : 'bg-blue-300'} 
                  border-4 border-white z-20`} 
                />
                {(isSelected || paper.isQueried) && (
                  <div className="absolute w-6 h-6 rounded-full bg-blue-500 opacity-50 animate-ping" />
                )}
              </div>

              <PaperCard 
                paper={paper} 
                isLeft={index % 2 === 0} 
                onSelect={handlePaperSelect}
                isSelected={isSelected}
                isCollapsed={isCollapsed}
              />                  

              <div className={`w-5/12 flex ${
                index % 2 === 0 ? 'justify-start pl-8' : 'justify-end pr-8'
              } transition-all duration-500 ${isCollapsed ? 'opacity-50' : 'opacity-100'}`}>
                {paper.publication_date && (
                  <div className={`text-lg font-semibold transition-colors duration-300
                    ${isSelected ? 'text-blue-600' : 'text-gray-600'}`}>
                    {new Date(paper.publication_date).getFullYear()}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResearchTimelineVisualization;