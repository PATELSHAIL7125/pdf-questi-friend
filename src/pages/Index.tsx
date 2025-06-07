
import React, { useState } from 'react';
import ModernHeader from '@/components/ModernHeader';
import PDFUploader from '@/components/PDFUploader';
import PDFViewer from '@/components/PDFViewer';
import QuestionInput from '@/components/QuestionInput';
import AnswerDisplay from '@/components/AnswerDisplay';
import MCQGenerator from '@/components/MCQGenerator';
import MCQDisplay from '@/components/MCQDisplay';
import { PDFProvider, usePDF } from '@/context/PDFContext';
import { Button } from '@/components/ui/button';
import { FileUp, Presentation, FileIcon, MessageSquare, HelpCircle, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const IndexContent: React.FC = () => {
  const { pdfUrl, setPdfFile, setPdfUrl, setPdfText, setTotalPages, setCurrentPage, setQuestions, mcqSet } = usePDF();
  const [activeTab, setActiveTab] = useState<string>("ask");
  
  const handleUploadNew = () => {
    setPdfFile(null);
    setPdfUrl(null);
    setPdfText(null);
    setTotalPages(0);
    setCurrentPage(1);
    setQuestions([]);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <ModernHeader />
      
      <div className="container py-8">
        {!pdfUrl ? (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Navigation Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileIcon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">PDF Analysis</CardTitle>
                  <CardDescription>
                    Currently selected - Upload and analyze PDF documents
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button variant="outline" className="w-full" disabled>
                    <FileIcon className="mr-2 h-4 w-4" />
                    Current Mode
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow border-2 hover:border-primary/30">
                <CardHeader className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                    <Presentation className="h-8 w-8 text-orange-600" />
                  </div>
                  <CardTitle className="text-xl">PowerPoint Analysis</CardTitle>
                  <CardDescription>
                    Switch to PowerPoint presentation analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Link to="/presentation">
                    <Button className="w-full">
                      <Presentation className="mr-2 h-4 w-4" />
                      Switch Mode
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Upload Section */}
            <Card className="border-dashed border-2 border-primary/30">
              <CardHeader className="text-center">
                <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Upload className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl">Upload Your PDF Document</CardTitle>
                <CardDescription className="text-base">
                  Drag and drop your PDF file or click to browse
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PDFUploader />
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Action Bar */}
            <Card>
              <CardContent className="flex justify-between items-center p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium">Document loaded successfully</span>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleUploadNew}
                  className="flex items-center gap-2"
                >
                  <FileUp className="h-4 w-4" />
                  Upload New PDF
                </Button>
              </CardContent>
            </Card>

            {/* PDF Viewer */}
            <Card>
              <CardContent className="p-6">
                <PDFViewer />
              </CardContent>
            </Card>
            
            {/* Interactive Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center">AI Analysis Tools</CardTitle>
                <CardDescription className="text-center">
                  Choose how you want to interact with your document
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs 
                  defaultValue="ask" 
                  value={activeTab} 
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-6 h-12">
                    <TabsTrigger value="ask" className="flex items-center gap-2 h-10">
                      <MessageSquare className="h-4 w-4" />
                      Ask Questions
                    </TabsTrigger>
                    <TabsTrigger value="mcq" className="flex items-center gap-2 h-10">
                      <HelpCircle className="h-4 w-4" />
                      Generate Quiz
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="ask" className="space-y-6">
                    <QuestionInput />
                    <AnswerDisplay />
                  </TabsContent>
                  
                  <TabsContent value="mcq" className="space-y-6">
                    <MCQGenerator />
                    <MCQDisplay />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

const Index: React.FC = () => {
  return (
    <PDFProvider>
      <IndexContent />
    </PDFProvider>
  );
};

export default Index;
