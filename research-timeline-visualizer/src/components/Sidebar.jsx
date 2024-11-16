import React, { useState } from 'react';

const Sidebar = ({ onFilterChange, filters, onSort, onResetFilters }) => {
  const [sortBy, setSortBy] = useState('');

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    onSort(e.target.value);
  };

  const handleResetFilters = () => {
    onResetFilters();
  };

  return (
    <div className="w-60 bg-white shadow-lg p-6 fixed h-full">
      <h2 className="text-2xl font-bold mb-6">Filters</h2>

      {/* Start Date (Year Only) */}
      <div className="mb-6">
        <label className="text-gray-700 font-medim mb-2">Start Year</label>
        <input
          type="number"
          min="1900"
          max={new Date().getFullYear()}
          value={filters.startDate}
          onChange={(e) => onFilterChange('startDate', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* End Date (Year Only) */}
      <div className="mb-6">
        <label className="text-gray-700 font-medium mb-2">End Year</label>
        <input
          type="number"
          min="1900"
          max={new Date().getFullYear()}
          value={filters.endDate}
          onChange={(e) => onFilterChange('endDate', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Author */}
      <div className="mb-6">
        <label className="text-gray-700 font-medium mb-2">Author</label>
        <input
          type="text"
          value={filters.author}
          onChange={(e) => onFilterChange('author', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Sorting */}
      <div className="mb-6">
        <label className="text-gray-700 font-medium mb-2">Sort By</label>
        <select
          value={sortBy}
          onChange={handleSortChange}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select an option</option>
          <option value="publication_date">Publication Date</option>
          <option value="relevance">Relevance</option>
        </select>
      </div>

      {/* Reset Filters */}
      <button
        onClick={handleResetFilters}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        Reset Filters
      </button>
      
    </div>
  );
};

export default Sidebar;