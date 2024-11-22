// App.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from './components/ui/Button';
import SearchBar from './components/Search/SearchBar';
import ErrorAlert from './components/ErrorAlert/ErrorAlert';
import ChatSidebar from './components/ChatSidebar';
import { MessageSquare, BookOpen, TrendingUp, ChevronRight } from 'lucide-react';
import PredictiveResearchIntelligence from './components/PredictiveResearchIntelligence';
import PaperRecommendations from './components/PaperRecommendations';
import ResearchInsights from './components/ResearchInsights';

function App() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('papers');
  const [papers, setPapers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const [lastSuccessfulSearch, setLastSuccessfulSearch] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [insights, setInsights] = useState(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  const toggleChat = () => {
    setIsChatOpen((prev) => !prev);
    if (isChatExpanded) {
      setIsChatExpanded(false);
    }
  };

  const toggleChatExpanded = () => {
    setIsChatExpanded((prev) => !prev);
  };

  // Fetch research insights
  const fetchInsights = async (searchQuery) => {
    if (!searchQuery) return;

    setIsLoadingInsights(true);
    try {
      const response = await axios.post('http://localhost:8000/research/analyze', {
        topic: searchQuery,
        research_depth: 'comprehensive'
      });
      setInsights(response.data);
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  // Fetch recommended papers
  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        'http://localhost:8000/research/recommend',
        {
          topic: query,
          research_depth: 'comprehensive'
        },
        { timeout: 1000000 }
      );

      if (!response.data || !response.data.papers) {
        setError('Invalid response format from server');
        setPapers([]);
        return;
      }

      const processedPapers = response.data.papers.map((paper, index) => ({
        ...paper,
        isQueried: index === 0
      }));

      setPapers(processedPapers);
      setTotalResults(processedPapers.length);
      setLastSuccessfulSearch(query);
      
      // Fetch insights after successful paper search
      fetchInsights(query);
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
              activeTab === 'papers' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setActiveTab('papers')}
          >
            Paper Recommendations
          </button>
          <button
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'insights' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setActiveTab('insights')}
          >
            Research Insights
          </button>
          <button
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'predictive' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setActiveTab('predictive')}
          >
            Predictive Intelligence
          </button>
          
        </div>

        {activeTab === 'papers' && (
          <PaperRecommendations 
            papers={papers}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'insights' && (
          <ResearchInsights 
            query={query}
            papers={papers}
            insights={insights}
            isLoading={isLoadingInsights}
          />
        )}


        {activeTab === 'predictive' && (
          <PredictiveResearchIntelligence 
            papers={papers} 
            query={query}
          />
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
            <ChatSidebar papers={papers} />
          </div>
        </div>
      </aside>
    </div>
  );
}

export default App;