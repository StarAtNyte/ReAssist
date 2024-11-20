import React, { useEffect, useRef } from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from './ui/select';

const PaperSelector = ({ papers, selectedPaper, onPaperSelect }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (title) => {
    const paper = papers.find(p => p.title === title);
    onPaperSelect(paper);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <div ref={selectRef} className="relative w-full">
      <div
        onClick={toggleDropdown}
        className="flex items-center justify-between w-full border rounded-md px-3 py-2 cursor-pointer"
      >
        <span className="text-sm truncate">
          {selectedPaper?.title || 'Select a paper'}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {papers.map((paper) => (
            <div
              key={paper.title}
              className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
              onClick={() => handleSelect(paper.title)}
            >
              {paper.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaperSelector;