import React from 'react';
import TimelineItem from './TimelineItem';

const TimelineList = ({ papers, lastSuccessfulSearch }) => {
  if (!papers.length) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold mb-2">
        Results for: {lastSuccessfulSearch}
      </h2>
      {papers.map((paper, index) => (
        <TimelineItem key={index} paper={paper} />
      ))}
    </div>
  );
};

export default TimelineList;

