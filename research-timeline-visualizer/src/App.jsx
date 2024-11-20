//App.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from './components/ui/Button';
import { MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [lastSuccessfulSearch, setLastSuccessfulSearch] = useState('');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    author: '',
    journal: '',
    keywords: '',
    citationCount: '',
  });
  const [sortBy, setSortBy] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [showInsights, setShowInsights] = useState(false);

  const toggleSidebar = () => {
    if (isChatExpanded) {
      setIsChatExpanded(false);
    }
    setIsSidebarOpen((prev) => !prev);
  };

  const toggleChat = () => {
    if (!isChatOpen) {
      setIsChatExpanded(false);
    }
    setIsChatOpen((prev) => !prev);
  };

  const toggleChatExpanded = () => {
    if (!isChatExpanded) {
      setIsSidebarOpen(false);
    }
    setIsChatExpanded((prev) => !prev);
  };

  // Function to apply filters to the papers list
  const applyFilters = (papers, filters) => {
    return papers.filter((paper) => {
      const matchesStartDate = filters.startDate
        ? new Date(paper.publication_date).getFullYear() >= parseInt(filters.startDate)
        : true;
      const matchesEndDate = filters.endDate
        ? new Date(paper.publication_date).getFullYear() <= parseInt(filters.endDate)
        : true;
      const matchesAuthor = filters.author
        ? paper.authors?.some((author) =>
            author.toLowerCase().includes(filters.author.toLowerCase())
          )
        : true;
      const matchesJournal = filters.journal
        ? paper.journal?.toLowerCase().includes(filters.journal.toLowerCase())
        : true;
      const matchesKeywords = filters.keywords
        ? paper.keywords?.some((keyword) =>
            keyword.toLowerCase().includes(filters.keywords.toLowerCase())
          )
        : true;
      const matchesCitationCount = filters.citationCount
        ? paper.citations >= parseInt(filters.citationCount)
        : true;

      return (
        matchesStartDate &&
        matchesEndDate &&
        matchesAuthor &&
        matchesJournal &&
        matchesKeywords &&
        matchesCitationCount
      );
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
            const authorMatch = a.authors?.some((author) =>
              author.toLowerCase().includes(word)
            )
              ? 1
              : 0;
            const keywordMatch = a.keywords?.some((keyword) =>
              keyword.toLowerCase().includes(word)
            )
              ? 1
              : 0;
            return sum + titleMatch + authorMatch + keywordMatch;
          }, 0);
          const bRelevance = queryWords.reduce((sum, word) => {
            const titleMatch = b.title.toLowerCase().includes(word) ? 1 : 0;
            const authorMatch = b.authors?.some((author) =>
              author.toLowerCase().includes(word)
            )
              ? 1
              : 0;
            const keywordMatch = b.keywords?.some((keyword) =>
              keyword.toLowerCase().includes(word)
            )
              ? 1
              : 0;
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
      const response = await axios.get(
        `http://127.0.0.1:8000/timeline?query=${encodeURIComponent(query)}&page=${currentPage}&page_size=100`,
        { timeout: 1000000 }
      );

      if (!response.data || !response.data.timeline) {
        setError('Invalid response format from server');
        setPapers([]);
        return;
      }
      
      const processedPapers = response.data.timeline.map((paper, index) => ({
        ...paper,
        isQueried: index === 0  // Mark first paper as most relevant
      }));

      setPapers(processedPapers);
      setTotalResults(response.data.total_results);
      setLastSuccessfulSearch(query);
      setShowInsights(true);
 
    } catch (err) {
      let errorMessage = 'An error occurred while searching';
      if (err.code === 'ECONNABORTED') {
        errorMessage = 'Search request timed out. Please try again.';
      } else if (err.response) {
        errorMessage =
          err.response.status === 404
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

  const handleFilterChange = (filterName, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterName]: value,
    }));
  };

  const handleSortChange = (sortBy) => {
    setSortBy(sortBy);
    const sortedPapers = sortPapers(filteredPapers, sortBy);
    setFilteredPapers(sortedPapers);
  };

  const handleResetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      author: '',
      journal: '',
      keywords: '',
      citationCount: '',
    });
    setFilteredPapers(papers);
    setSortBy('');
  };

  useEffect(() => {
    const filtered = applyFilters(papers, filters);
    const sorted = sortPapers(filtered, sortBy);
    setFilteredPapers(sorted);
  }, [filters, papers, sortBy]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-[280px] border-r bg-white z-10 transition-transform duration-300 ${
          !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'
        }`}
      >
        <Sidebar
          onFilterChange={handleFilterChange}
          filters={filters}
          onSort={handleSortChange}
          onResetFilters={handleResetFilters}
          sortBy={sortBy}
        />
      </aside>

      {/* Show Left Sidebar Button */}
      {!isSidebarOpen && (
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          className="fixed left-4 top-1/2 -translate-y-1/2 transform shadow-md hover:bg-gray-100 z-20"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      )}

      {/* Main Content */}
      <main
        className={`flex-1 p-6 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'ml-[280px]' : 'ml-0'
        } ${isChatOpen ? (isChatExpanded ? 'mr-[600px]' : 'mr-[320px]') : 'mr-0'}`}
      >
        <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">ReAssist</h1>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowInsights(!showInsights)}
                className="flex items-center gap-2"
              >
                {showInsights ? 'Hide Insights' : 'Show Insights'}
              </Button>
              <Button
                variant="outline"
                onClick={toggleChat}
                className="flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                {isChatOpen ? 'Hide Chat' : 'Show Chat'}
              </Button>
            </div>
          </div>
          <SearchBar
            query={query}
            setQuery={setQuery}
            handleSearch={handleSearch}
            isLoading={isLoading}
          />
          <ErrorAlert error={error} />
        </div>

        {/* Conditional Rendering of Insights Generator */}
       

        {filteredPapers.length > 0 && (
          <ResearchTimelineVisualization 
            papers={filteredPapers} 
            searchQuery={query}
          />
        )}

        {totalResults > 0 && (
          <div className="mt-6 text-center">
            <p>{`Showing ${filteredPapers.length} of ${totalResults} results`}</p>
          </div>
        )}
      </main>

      {/* Chat Sidebar */}
      <aside
        className={`fixed right-0 top-0 h-screen bg-white transform transition-all duration-300 ease-in-out ${
          !isChatOpen ? 'translate-x-full' : 'translate-x-0'
        } ${isChatExpanded ? 'w-[600px]' : 'w-[320px]'} border-l z-10`}
      >
        <div className="relative h-full">
          {isChatExpanded && (
            <Button
              variant="outline"
              size="icon"
              onClick={toggleChatExpanded}
              className="fixed right-[600px] top-1/2 -translate-y-1/2 transform shadow-md hover:bg-gray-100 z-20"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          )}
          <div 
            className="h-full cursor-pointer" 
            onClick={!isChatExpanded ? toggleChatExpanded : undefined}
          >
          <ChatSidebar papers={filteredPapers} />
      </div>
        </div>
      </aside>
    </div>
  );
}

export default App;