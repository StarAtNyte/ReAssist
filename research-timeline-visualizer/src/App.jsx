import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchBar from './components/Search/SearchBar';
import ResearchTimelineVisualization from './components/ResearchTimelineVisualization';
import ErrorAlert from './components/ErrorAlert/ErrorAlert';

function App() {
  const [query, setQuery] = useState('');
  const [papers, setPapers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastSuccessfulSearch, setLastSuccessfulSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [debugInfo, setDebugInfo] = useState(null); // For debugging purposes

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setIsLoading(true);
    setError(null);
    setDebugInfo(null);

    try {
      console.log('Sending request to:', `http://127.0.0.1:8000/timeline?query=${encodeURIComponent(query)}&page=${currentPage}&page_size=100`);
      
      const response = await axios.get(`http://127.0.0.1:8000/timeline?query=${encodeURIComponent(query)}&page=${currentPage}&page_size=100`, {
        timeout: 1000000
      });
      
      console.log('Response received:', response.data);
      setDebugInfo(response.data); // Store response for debugging

      if (!response.data || !response.data.timeline) {
        setError('Invalid response format from server');
        setPapers([]);
        return;
      }
      
      setPapers(response.data.timeline);
      setTotalResults(response.data.total_results);
      setLastSuccessfulSearch(query);
    } catch (err) {
      console.error('Search error:', err);
      let errorMessage = 'An error occurred while searching';
      
      if (err.code === 'ECONNABORTED') {
        errorMessage = 'Search request timed out. Please try again.';
      } else if (err.response) {
        errorMessage = err.response.status === 404 
          ? 'Search service not found. Please check if the server is running.'
          : `Server error: ${err.response.status}`;
      } else if (err.request) {
        errorMessage = 'Unable to reach the search server. Please check your connection.';
      }
      
      setError(errorMessage);
      setPapers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Research Timeline Visualizer</h1>
        <SearchBar
          query={query}
          setQuery={setQuery}
          handleSearch={handleSearch}
          isLoading={isLoading}
          handleKeyPress={handleKeyPress}
        />
        <ErrorAlert error={error} />
      </div>

      {papers.length > 0 && (
        <ResearchTimelineVisualization papers={papers} />
      )} 
    </div>
  );
}

export default App;