import React from 'react';

const TimelineItem = ({ paper }) => {
  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold text-blue-600">
        <a
          href={paper.link}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          {paper.title}
        </a>
      </h3>
      <p className="text-sm text-gray-600 mt-1">
        By: {paper.authors.join(", ")}
      </p>
      <p className="text-sm text-gray-500 mt-1">
        Published: {paper.publication_date}
      </p>
      <p className="mt-2 text-gray-700 line-clamp-3">
        {paper.abstract}
      </p>
    </div>
  );
};

export default TimelineItem;