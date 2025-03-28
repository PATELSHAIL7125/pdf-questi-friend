
import React from 'react';
import { FileUp } from 'lucide-react';

const FeatureGrid: React.FC = () => {
  return (
    <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
      <div className="flex flex-col items-center p-4 rounded-lg bg-background/50 border border-border">
        <div className="bg-primary/10 p-2 rounded-full mb-2">
          <FileUp className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-sm font-medium">Upload Presentation</h3>
        <p className="text-xs text-center text-muted-foreground mt-1">Drag & drop or browse</p>
      </div>
      
      <div className="flex flex-col items-center p-4 rounded-lg bg-background/50 border border-border">
        <div className="bg-primary/10 p-2 rounded-full mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <h3 className="text-sm font-medium">Ask Questions</h3>
        <p className="text-xs text-center text-muted-foreground mt-1">Get instant answers</p>
      </div>
      
      <div className="flex flex-col items-center p-4 rounded-lg bg-background/50 border border-border">
        <div className="bg-primary/10 p-2 rounded-full mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h3 className="text-sm font-medium">Get Insights</h3>
        <p className="text-xs text-center text-muted-foreground mt-1">Extract key information</p>
      </div>
    </div>
  );
};

export default FeatureGrid;
