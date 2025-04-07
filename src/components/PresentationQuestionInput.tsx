
import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePDF } from '@/context/PDFContext';
import { useToast } from '@/components/ui/use-toast';

const PresentationQuestionInput: React.FC = () => {
  const { toast } = useToast();
  const { presentationText, askPresentationQuestion, isPresentationAnswerLoading } = usePDF();
  const [question, setQuestion] = useState('');
  
  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) return;
    
    if (!presentationText) {
      toast({
        title: "No presentation loaded",
        description: "Please upload a PowerPoint file before asking questions.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await askPresentationQuestion(question);
      setQuestion('');
    } catch (error) {
      console.error('Error processing question:', error);
      toast({
        title: "Error processing question",
        description: "There was a problem processing your question. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="w-full max-w-4xl mt-4 mb-6 animate-fade-in">
      <form onSubmit={handleQuestionSubmit} className="relative">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about your presentation..."
          disabled={isPresentationAnswerLoading || !presentationText}
          className="w-full h-14 pl-4 pr-16 rounded-full border border-input 
                    bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 
                    transition-all duration-200 shadow-sm"
        />
        <Button
          type="submit"
          disabled={isPresentationAnswerLoading || !presentationText || !question.trim()}
          className="absolute right-2 top-2 rounded-full p-2 h-10 w-10 bg-primary text-white"
        >
          {isPresentationAnswerLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </form>
    </div>
  );
};

export default PresentationQuestionInput;
// import React, { useState } from 'react';
// import { Send } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { usePDF } from '@/context/PDFContext';
// import { useToast } from '@/components/ui/use-toast';
// import { queryGeminiAboutPresentation } from './utils/api/auth/geminiApi';

// const PresentationQuestionInput: React.FC = () => {
//   const [question, setQuestion] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const { presentationText, setAnswer } = usePDF();
//   const { toast } = useToast();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!question.trim()) {
//       toast({
//         title: 'Question Required',
//         description: 'Please enter a question about the presentation.',
//         variant: 'destructive',
//       });
//       return;
//     }
    
//     if (!presentationText) {
//       toast({
//         title: 'No Presentation Text',
//         description: 'Unable to find presentation content to analyze.',
//         variant: 'destructive',
//       });
//       return;
//     }
    
//     setIsLoading(true);
    
//     try {
//       // Call the Gemini API with the presentation text and user question
//       const response = await queryGeminiAboutPresentation(presentationText, question);
      
//       // Update the answer in the context
//       setAnswer({
//         question,
//         response,
//         timestamp: new Date().toISOString(),
//       });
      
//       // Clear the question input
//       setQuestion('');
//     } catch (error) {
//       console.error('Error processing question:', error);
//       toast({
//         title: 'Error',
//         description: 'An error occurred while processing your question. Please try again.',
//         variant: 'destructive',
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };
  
//   return (
//     <form onSubmit={handleSubmit} className="w-full mb-6">
//       <div className="flex items-center gap-2">
//         <Input
//           value={question}
//           onChange={(e) => setQuestion(e.target.value)}
//           placeholder="Ask a question about your presentation..."
//           className="flex-1"
//           disabled={isLoading}
//         />
//         <Button 
//           type="submit" 
//           disabled={isLoading || !question.trim()} 
//           className="button-transition"
//         >
//           {isLoading ? (
//             <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
//           ) : (
//             <Send className="h-5 w-5" />
//           )}
//         </Button>
//       </div>
//     </form>
//   );
// };

// export default PresentationQuestionInput;