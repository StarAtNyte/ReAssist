import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorAlert = ({ error }) => {
  if (!error) return null;

  return (
    <div className="mb-4 p-4 border border-red-500 bg-red-50 text-red-700 rounded-md">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-5 w-5" />
        <span className="font-semibold">Error</span>
      </div>
      <p className="mt-1 ml-7">{error}</p>
    </div>
  );
};

export default ErrorAlert;