import React from 'react';
import { Loader2, Search } from 'lucide-react';

const SearchBar = ({ query, setQuery, handleSearch, isLoading }) => {
  const handleKeyPress = (e) => {
    // Check if the pressed key is 'Enter' (key code 13)
    if (e.key === 'Enter') {
      handleSearch(); // Trigger the search function when Enter is pressed
    }
  };

  return (
    <div className="flex justify-center gap-4 mt-16 mb-8">
      <div className="relative w-full sm:w-96 md:w-1/2 lg:w-1/3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyPress} // Use onKeyDown instead of onKeyPress
          placeholder="Search for research papers..."
          className="w-full p-3 pr-10 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        {isLoading && (
          <div className="absolute right-3 top-3">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          </div>
        )}
      </div>
      <button
        onClick={handleSearch}
        disabled={isLoading}
        className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <Search className="h-4 w-4" />
        Search
      </button>
    </div>
  );
};

export default SearchBar;
