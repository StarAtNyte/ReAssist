//App.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from './components/ui/Button';
import SearchBar from './components/Search/SearchBar';
import ResearchTimelineVisualization from './components/ResearchTimelineVisualization';
import ErrorAlert from './components/ErrorAlert/ErrorAlert';
import Sidebar from './components/Sidebar';
import ChatSidebar from './components/ChatSidebar';
import { MessageSquare, BookOpen, TrendingUp, ChevronRight } from 'lucide-react';
import PredictiveResearchIntelligence from './components/PredictiveResearchIntelligence';

function App() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('timeline'); 
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

  const toggleChat = () => {
    setIsChatOpen((prev) => !prev);
    if (isChatExpanded) {
      setIsChatExpanded(false);
    }
  };

  const toggleChatExpanded = () => {
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

  useEffect(() => {
    const filtered = applyFilters(papers, filters);
    const sorted = sortPapers(filtered, sortBy);
    setFilteredPapers(sorted);
  }, [filters, papers, sortBy]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Main Content */}
      <main 
        className={`flex-1 p-6 transition-all duration-300 ease-in-out ${
          isChatOpen ? (isChatExpanded ? 'mr-[600px]' : 'mr-[320px]') : 'mr-0'
        }`}
      >
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-500 text-white p-2 rounded-lg shadow-md">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                  Re<span className="text-blue-500">Assist</span>
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Research Intelligence Companion
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">
                  {totalResults} Research Papers
                </span>
              </div>
              <Button
                variant="outline"
                onClick={toggleChat}
                className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600"
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

        <div className="flex space-x-4 mb-4">
          <button
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'timeline' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setActiveTab('timeline')}
          >
            Research Timeline
          </button>
          <button
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'predictive' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setActiveTab('predictive')}
          >
            Predictive Research Intelligence
          </button>
        </div>

        {/* Conditional Rendering Based on Active Tab */}
        {activeTab === 'timeline' && filteredPapers.length > 0 && (
          <>
            <hr className="my-4 border-t border-gray-300" />
            <ResearchTimelineVisualization 
              papers={filteredPapers} 
              searchQuery={query}
            />
          </>
        )}
        {activeTab === 'predictive' && (
          <PredictiveResearchIntelligence 
          papers={filteredPapers} 
          query={query}
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
        } ${isChatExpanded ? 'w-[600px]' : 'w-[338px]'} border-l z-10`}
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