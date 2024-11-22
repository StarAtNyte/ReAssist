import React from 'react';
import { BookOpen, TrendingUp, LineChart } from 'lucide-react';
import { Button } from './ui/Button';

const AnalysisTools = ({ onAnalyzeClick, isAnalyzing }) => {
  return (
    <div className="flex gap-2 p-2 border-t">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onAnalyzeClick('overview')}
        disabled={isAnalyzing}
        className="flex items-center gap-1"
      >
        <BookOpen className="w-4 h-4" />
        <span className="text-xs">Overview</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onAnalyzeClick('findings')}
        disabled={isAnalyzing}
        className="flex items-center gap-1"
      >
        <TrendingUp className="w-4 h-4" />
        <span className="text-xs">Summarize Findings</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onAnalyzeClick('visualize')}
        disabled={isAnalyzing}
        className="flex items-center gap-1"
      >
        <LineChart className="w-4 h-4" />
        <span className="text-xs">Visual Summary</span>
      </Button>
    </div>
  );
};

export default AnalysisTools;