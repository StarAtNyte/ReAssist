import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from './components/ui/Button';
import { MessageSquare } from 'lucide-react';
import SearchBar from './components/Search/SearchBar';
import ResearchTimelineVisualization from './components/ResearchTimelineVisualization';
import ErrorAlert from './components/ErrorAlert/ErrorAlert';
import Sidebar from './components/Sidebar';
import ChatSidebar from './components/ChatSidebar';

function App() {
  const [query, setQuery] = useState('');
  const [papers, setPapers] = useState([]);
  const [filteredPapers, setFilteredPapers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastSuccessfulSearch, setLastSuccessfulSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    author: '',
    journal: '',
    keywords: '',
    citationCount: ''
  });
  const [sortBy, setSortBy] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(true);

  // Function to apply filters to the papers list
  const applyFilters = (papers, filters) => {
    return papers.filter(paper => {
      const matchesStartDate = filters.startDate ? new Date(paper.publication_date).getFullYear() >= parseInt(filters.startDate) : true;
      const matchesEndDate = filters.endDate ? new Date(paper.publication_date).getFullYear() <= parseInt(filters.endDate) : true;
      const matchesAuthor = filters.author ? paper.authors?.some((author) => author.toLowerCase().includes(filters.author.toLowerCase())) : true;
      const matchesJournal = filters.journal ? paper.journal?.toLowerCase().includes(filters.journal.toLowerCase()) : true;
      const matchesKeywords = filters.keywords ? paper.keywords?.some((keyword) => keyword.toLowerCase().includes(filters.keywords.toLowerCase())) : true;
      const matchesCitationCount = filters.citationCount ? paper.citations >= parseInt(filters.citationCount) : true;

      return matchesStartDate && matchesEndDate && matchesAuthor && matchesJournal && matchesKeywords && matchesCitationCount;
    });
  };

  // Function to sort the papers based on the selected criteria
  const sortPapers = (papers, sortBy) => {
    switch (sortBy) {
      case 'publication_date':
        return [...papers].sort((a, b) => new Date(b.publication_date) - new Date(a.publication_date));
      case 'citations':
        return [...papers].sort((a, b) => b.citations - a.citations);
      case 'relevance':
        return [...papers].sort((a, b) => {
          const queryWords = query.toLowerCase().split(' ');
          const aRelevance = queryWords.reduce((sum, word) => {
            const titleMatch = a.title.toLowerCase().includes(word) ? 1 : 0;
            const authorMatch = a.authors?.some(author => author.toLowerCase().includes(word)) ? 1 : 0;
            const keywordMatch = a.keywords?.some(keyword => keyword.toLowerCase().includes(word)) ? 1 : 0;
            return sum + titleMatch + authorMatch + keywordMatch;
          }, 0);
          const bRelevance = queryWords.reduce((sum, word) => {
            const titleMatch = b.title.toLowerCase().includes(word) ? 1 : 0;
            const authorMatch = b.authors?.some(author => author.toLowerCase().includes(word)) ? 1 : 0;
            const keywordMatch = b.keywords?.some(keyword => keyword.toLowerCase().includes(word)) ? 1 : 0;
            return sum + titleMatch + authorMatch + keywordMatch;
          }, 0);
          return bRelevance - aRelevance;
        });
      default:
        return papers;
    }
  };

  // Fetch timeline data from the API
  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`http://127.0.0.1:8000/timeline?query=${encodeURIComponent(query)}&page=${currentPage}&page_size=100`, {
        timeout: 1000000
      });

      if (!response.data || !response.data.timeline) {
        setError('Invalid response format from server');
        setPapers([]);
        return;
      }

      setPapers(response.data.timeline);
      setTotalResults(response.data.total_results);
      setLastSuccessfulSearch(query);
    } catch (err) {
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

  // Handler for paper selection from chat
  const handlePaperSelect = (paperTitle) => {
    setQuery(paperTitle);
    handleSearch();
  };

  // Function to handle filter change (from Sidebar component)
  const handleFilterChange = (filterName, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterName]: value
    }));
  };

  // Function to handle sort change (from Sidebar component)
  const handleSortChange = (sortBy) => {
    setSortBy(sortBy);
    const sortedPapers = sortPapers(filteredPapers, sortBy);
    setFilteredPapers(sortedPapers);
  };

  // Function to reset filters
  const handleResetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      author: '',
      journal: '',
      keywords: '',
      citationCount: ''
    });
    setFilteredPapers(papers);
    setSortBy('');
  };

 

  // Apply filters and sorting when papers or filters change
  useEffect(() => {
    const filtered = applyFilters(papers, filters);
    const sorted = sortPapers(filtered, sortBy);
    setFilteredPapers(sorted);
  }, [filters, papers, sortBy]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

// Toggle chat sidebar
const toggleChat = () => {
  setIsChatOpen(prev => !prev);
};

return (
  <div className="flex min-h-screen bg-gray-50">
    {/* Left Sidebar */}
    <Sidebar
      onFilterChange={handleFilterChange}
      filters={filters}
      onSort={handleSortChange}
      onResetFilters={handleResetFilters}
      sortBy={sortBy}
      className="fixed left-0 top-0 h-screen w-[280px] border-r bg-white z-10"
    />

    {/* Main Content */}
    <main 
      className={`
        flex-1 p-6
        transition-all duration-300 ease-in-out
        ml-[280px]
        ${isChatOpen ? 'mr-[320px]' : 'mr-0'}
      `}
    >
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Research Timeline Visualizer</h1>
          <Button
            variant="outline"
            onClick={toggleChat}
            className="flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            {isChatOpen ? 'Hide Chat' : 'Show Chat'}
          </Button>
        </div>
        
        <SearchBar
          query={query}
          setQuery={setQuery}
          handleSearch={handleSearch}
          isLoading={isLoading}
          handleKeyPress={handleKeyPress}
        />
        <ErrorAlert error={error} />
      </div>

      {filteredPapers.length > 0 && (
        <ResearchTimelineVisualization papers={filteredPapers} />
      )}

      {totalResults > 0 && (
        <div className="mt-6 text-center">
          <p>{`Showing ${filteredPapers.length} of ${totalResults} results`}</p>
        </div>
      )}
    </main>

    {/* Chat Sidebar */}
    <aside 
      className={`
        fixed right-0 top-0 h-screen w-[320px] bg-white
        transform transition-transform duration-300 ease-in-out
        ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}
        border-l z-10
      `}
    >
      <ChatSidebar
        onPaperSelect={handlePaperSelect}
      />
    </aside>
  </div>
);
}

export default App;