
import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Presentation, ArrowRight, Sparkles, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ModernHeader from '@/components/ModernHeader';

const ModernHomePage: React.FC = () => {
  const features = [
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "AI-Powered Analysis",
      description: "Advanced AI understands your documents and provides intelligent answers"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Lightning Fast",
      description: "Get instant responses to your questions with our optimized processing"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure & Private",
      description: "Your documents are processed securely with enterprise-grade encryption"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <ModernHeader />
      
      <main className="container py-12 space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center rounded-full border px-4 py-2 text-sm bg-muted/50">
              <Sparkles className="mr-2 h-4 w-4" />
              Powered by Advanced AI
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Transform Your Documents
              <span className="block bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Into Interactive Knowledge
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Upload PDFs or PowerPoint presentations and chat with your documents using AI. 
              Get instant answers, generate quizzes, and extract insights effortlessly.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="min-w-[200px] h-12">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" size="lg" className="min-w-[200px] h-12">
                Create Account
              </Button>
            </Link>
          </div>
        </section>

        {/* Upload Options */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">Choose Your Document Type</h2>
            <p className="text-muted-foreground">Select the type of document you want to analyze</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50">
              <CardHeader className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">PDF Documents</CardTitle>
                <CardDescription className="text-base">
                  Upload and analyze PDF documents, research papers, reports, and more
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Link to="/login">
                  <Button className="w-full" size="lg">
                    Upload PDF
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50">
              <CardHeader className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Presentation className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">PowerPoint Slides</CardTitle>
                <CardDescription className="text-base">
                  Analyze PowerPoint presentations, lecture slides, and business decks
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Link to="/login">
                  <Button className="w-full" size="lg">
                    Upload PowerPoint
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Features */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">Why Choose PDF Insight?</h2>
            <p className="text-muted-foreground">Powerful features to enhance your document analysis</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ModernHomePage;
