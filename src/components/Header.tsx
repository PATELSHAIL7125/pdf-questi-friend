
import React from 'react';
import { FileText } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="w-full py-4 px-6 flex items-center justify-between glass-panel rounded-xl mb-6 animate-fade-in">
      <div className="flex items-center space-x-2">
        <FileText className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-medium tracking-tight">PDF Insight</h1>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-xs text-muted-foreground font-medium tracking-wide uppercase">
          Ask anything about your PDFs
        </span>
      </div>
    </header>
  );
};

export default Header;
