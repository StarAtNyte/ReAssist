//ResearchAnalysis.jsx
import React, { useState } from 'react';
import ResearchTimelineVisualization from './ResearchTimelineVisualization';
import ChatSidebar from './ChatSidebar';
import { Card } from './ui/card';
import { Input } from './ui/input';

const ResearchAnalysis = () => {
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [papers, setPapers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(`http://localhost:8000/timeline?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      setPapers(data.timeline);
      setSearchQuery(query);
      // Reset selection when new search is performed
      setSelectedPaper(null);
    } catch (error) {
      console.error('Error fetching timeline:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(searchQuery);
    }
  };

  const handlePaperSelect = (paper) => {
    setSelectedPaper(paper);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 p-4 overflow-auto">
        <Card className="mb-4 p-4">
          <div className="relative flex gap-4">
            <Input
              type="text"
              placeholder="Search research papers..."
              value={searchQuery}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="flex-1"
              disabled={isSearching}
            />
            <button
              onClick={() => handleSearch(searchQuery)}
              disabled={isSearching}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </Card>
        <ResearchTimelineVisualization 
          papers={papers} 
          searchQuery={searchQuery}
          onPaperSelect={handlePaperSelect}
          selectedPaperId={selectedPaper?.id}
        />
      </div>
      <div className="w-1/3 border-l">
        <ChatSidebar 
          papers={papers}
          selectedPaper={selectedPaper}
          onPaperSelect={handlePaperSelect}
        />
      </div>
    </div>
  );
};

export default ResearchAnalysis;