
import React from 'react';
import { Card } from '@/components/ui/card';
import { Presentation } from 'lucide-react';

const PresentationHeader: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-primary/20 to-background p-6 flex items-center justify-center">
      <Presentation className="h-16 w-16 text-primary" />
      <div className="ml-4 text-left">
        <h2 className="text-2xl font-bold text-foreground">Presentation Insight</h2>
        <p className="text-muted-foreground">Upload your PowerPoint to start analyzing</p>
      </div>
    </div>
  );
};

export default PresentationHeader;
