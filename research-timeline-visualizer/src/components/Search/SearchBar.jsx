import React from 'react';
import { Loader2, Search } from 'lucide-react';

const SearchBar = ({ query, setQuery, handleSearch, isLoading, handleKeyPress }) => {
  return (
    <div className="flex gap-2 mb-4">
      <div className="relative flex-1">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search for research papers..."
          className="w-full p-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        {isLoading && (
          <div className="absolute right-3 top-2.5">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          </div>
        )}
      </div>
      <button
        onClick={handleSearch}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <Search className="h-4 w-4" />
        Search
      </button>
    </div>
  );
};

export default SearchBar;