
import React from 'react';
import ModernHeader from '@/components/ModernHeader';
import PresentationUploader from '@/components/PresentationUploader';
import PresentationViewer from '@/components/PresentationViewer';
import PresentationMCQGenerator from '@/components/PresentationMCQGenerator';
import PresentationMCQDisplay from '@/components/PresentationMCQDisplay';
import { Button } from '@/components/ui/button';
import { FileIcon, Presentation, FileUp, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PDFProvider, usePDF } from '@/context/PDFContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RecentUploads from '@/components/RecentUploads';

const PresentationContent: React.FC = () => {
  const { presentationFile, setPresentationFile, setPresentationText } = usePDF();
  
  const handleUploadNew = () => {
    setPresentationFile(null);
    setPresentationText(null);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <ModernHeader />
      
      <div className="container py-8">
        {!presentationFile ? (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Navigation Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-shadow border-2 hover:border-primary/30">
                <CardHeader className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <FileIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">PDF Analysis</CardTitle>
                  <CardDescription>
                    Switch to PDF document analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Link to="/">
                    <Button className="w-full">
                      <FileIcon className="mr-2 h-4 w-4" />
                      Switch Mode
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 dark:from-orange-900/10 to-transparent">
                <CardHeader className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <Presentation className="h-8 w-8 text-orange-600" />
                  </div>
                  <CardTitle className="text-xl">PowerPoint Analysis</CardTitle>
                  <CardDescription>
                    Currently selected - Upload and analyze presentations
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button variant="outline" className="w-full" disabled>
                    <Presentation className="mr-2 h-4 w-4" />
                    Current Mode
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Upload Section */}
            <Card className="border-dashed border-2 border-orange-300 dark:border-orange-700">
              <CardHeader className="text-center">
                <div className="mx-auto w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mb-4">
                  <Upload className="h-10 w-10 text-orange-600" />
                </div>
                <CardTitle className="text-2xl">Upload Your PowerPoint Presentation</CardTitle>
                <CardDescription className="text-base">
                  Drag and drop your PowerPoint file or click to browse
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PresentationUploader />
              </CardContent>
            </Card>

            {/* Recent Uploads */}
            <RecentUploads />
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Action Bar */}
            <Card>
              <CardContent className="flex justify-between items-center p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium">Presentation loaded successfully</span>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleUploadNew}
                  className="flex items-center gap-2"
                >
                  <FileUp className="h-4 w-4" />
                  Upload New Presentation
                </Button>
              </CardContent>
            </Card>

            {/* Presentation Viewer with integrated Q&A */}
            <PresentationViewer />

            {/* MCQ Tools */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center">Quiz Generation</CardTitle>
                <CardDescription className="text-center">
                  Generate multiple choice questions from your presentation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <PresentationMCQGenerator />
                <PresentationMCQDisplay />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

const PresentationPage: React.FC = () => {
  return (
    <PDFProvider>
      <PresentationContent />
    </PDFProvider>
  );
};

export default PresentationPage;
