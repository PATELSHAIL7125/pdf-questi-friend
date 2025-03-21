
import React from 'react';
import { FileText, LogIn, User, FileUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-4 py-20 bg-gradient-to-b from-primary/10 to-background min-h-[70vh]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <FileText className="h-12 w-12 text-primary mr-3" />
            <h1 className="text-4xl font-bold tracking-tight">PDF Insight</h1>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-medium text-foreground/90 mt-4 mb-6">
            Extract valuable insights from your PDF documents with AI
          </h2>
          
          <p className="text-lg text-muted-foreground mb-8">
            Upload any PDF document and ask questions to get instant, accurate answers using our advanced AI.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            {isAuthenticated ? (
              <Button 
                size="lg" 
                className="px-8 py-6 text-lg" 
                onClick={() => navigate('/')}
              >
                <FileUp className="mr-2" /> 
                Upload a PDF
              </Button>
            ) : (
              <>
                <Button 
                  size="lg" 
                  className="px-8 py-6 text-lg" 
                  onClick={() => navigate('/login')}
                >
                  <LogIn className="mr-2" /> 
                  Login
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="px-8 py-6 text-lg" 
                  onClick={() => navigate('/register')}
                >
                  <User className="mr-2" /> 
                  Register
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-accent">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-background p-6 rounded-lg shadow-sm">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <FileUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">1. Upload Your PDF</h3>
              <p className="text-muted-foreground">Simply drag and drop or select any PDF document you want to analyze.</p>
            </div>
            
            <div className="bg-background p-6 rounded-lg shadow-sm">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">2. Review Content</h3>
              <p className="text-muted-foreground">Our system processes and extracts the content from your PDF document.</p>
            </div>
            
            <div className="bg-background p-6 rounded-lg shadow-sm">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">3. Ask Questions</h3>
              <p className="text-muted-foreground">Ask specific questions about the content and get instant, accurate answers.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;