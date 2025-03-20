
import React from 'react';
import { FileText, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="w-full py-4 px-6 flex items-center justify-between glass-panel rounded-xl mb-6 animate-fade-in">
      <div className="flex items-center space-x-2">
        <FileText className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-medium tracking-tight">PDF Insight</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <span className="text-xs text-muted-foreground font-medium tracking-wide uppercase hidden md:inline-block">
          Ask anything about your PDFs
        </span>
        
        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium hidden md:block">
              {user?.name || user?.email}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                logout();
                navigate('/home');
              }}
            >
              <LogOut className="h-4 w-4 mr-1" /> 
              <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/login')}
            >
              <User className="h-4 w-4 mr-1" /> 
              <span className="hidden md:inline">Login</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
