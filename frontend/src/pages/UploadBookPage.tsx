import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useSubmitBook } from '../hooks/useQueries';
import type { Book } from '../backend';
import BookForm from '../components/BookForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, BookOpen, CheckCircle } from 'lucide-react';
import AuthPrompt from '../components/AuthPrompt';

export default function UploadBookPage() {
  const { identity } = useInternetIdentity();
  const [formOpen, setFormOpen] = useState(false);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const submitBook = useSubmitBook();

  const isAuthenticated = !!identity;

  const handleUploadClick = () => {
    if (!isAuthenticated) {
      setAuthPromptOpen(true);
      return;
    }
    setFormOpen(true);
  };

  const handleSubmit = async (book: Book) => {
    await submitBook.mutateAsync(book);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-primary/10 rounded-full">
                <Upload className="h-12 w-12 md:h-16 md:w-16 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold">
              Upload Your Book
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Share your literary work with our community. All submissions are reviewed by our team before publication.
            </p>
          </div>

          {/* Submission Guidelines */}
          <Card className="rounded-3xl border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Submission Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Original Content</p>
                    <p className="text-sm text-muted-foreground">
                      Ensure you have the rights to publish the content
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Complete Information</p>
                    <p className="text-sm text-muted-foreground">
                      Provide accurate title, author, and description
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Quality Cover Image</p>
                    <p className="text-sm text-muted-foreground">
                      Use a clear, high-resolution book cover
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">PDF Format</p>
                    <p className="text-sm text-muted-foreground">
                      Upload your book as a PDF file (optional)
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> After submission, your book will be reviewed by our admin team. 
                  You can edit your book up to 3 times after approval. If you need more edits, you can request additional permissions.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Upload Button */}
          <div className="text-center">
            <Button
              size="lg"
              onClick={handleUploadClick}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-12 py-6 text-lg font-medium shadow-lg w-full md:w-auto"
            >
              <Upload className="mr-2 h-5 w-5" />
              {isAuthenticated ? 'Submit Your Book' : 'Log In to Upload'}
            </Button>
          </div>
        </div>
      </div>

      {/* Book Form Dialog */}
      <BookForm 
        open={formOpen} 
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        mode="submit"
      />

      {/* Auth Prompt Modal */}
      <AuthPrompt
        open={authPromptOpen}
        onOpenChange={setAuthPromptOpen}
        message="Please log in to upload and share your books with the community."
      />
    </div>
  );
}
