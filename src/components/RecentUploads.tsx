
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Presentation } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';

const RecentUploads = () => {
  const { toast } = useToast();
  
  const { data: uploads, isLoading, error } = useQuery({
    queryKey: ['user-uploads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_uploads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (error) throw error;
      return data;
    }
  });

  if (error) {
    console.error('Error fetching uploads:', error);
    toast({
      title: "Error fetching uploads",
      description: "Could not load your recent uploads.",
      variant: "destructive"
    });
  }

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 p-4">
      <h2 className="text-xl font-semibold mb-4">Recent Uploads</h2>
      
      {isLoading ? (
        <div className="text-center text-muted-foreground">Loading recent uploads...</div>
      ) : uploads && uploads.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>File Name</TableHead>
              <TableHead>Uploaded</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {uploads.map((upload) => (
              <TableRow key={upload.id}>
                <TableCell>
                  {upload.file_type === 'pdf' ? (
                    <FileText className="h-4 w-4 text-primary" />
                  ) : (
                    <Presentation className="h-4 w-4 text-primary" />
                  )}
                </TableCell>
                <TableCell>{upload.file_name}</TableCell>
                <TableCell>
                  {format(new Date(upload.created_at), 'MMM d, yyyy')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center text-muted-foreground">No recent uploads found</div>
      )}
    </div>
  );
};

export default RecentUploads;
