import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSubmitBookForApproval } from '../hooks/useQueries';
import type { Book } from '../backend';
import BookForm from '../components/BookForm';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, Upload, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function UploadBookPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const submitBook = useSubmitBookForApproval();
  const [formOpen, setFormOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isAuthenticated = !!identity;

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Please log in to upload books.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12">
        <Skeleton className="h-12 w-64 mb-8" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isFetched && !userProfile) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Please complete your profile setup before uploading books.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleSubmit = async (book: Book) => {
    await submitBook.mutateAsync(book);
    setSubmitted(true);
    setFormOpen(false);
  };

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="font-serif text-2xl md:text-3xl">Book Submitted Successfully!</CardTitle>
            <CardDescription className="text-sm md:text-base">
              Your book has been submitted for admin review. You'll be able to see it in your books once it's approved.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate({ to: '/my-books' })} variant="outline" className="w-full sm:w-auto">
              View My Books
            </Button>
            <Button onClick={() => setSubmitted(false)} className="w-full sm:w-auto">
              Submit Another Book
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 md:mb-8">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">Upload a Book</h1>
            <p className="text-muted-foreground text-sm md:text-base">Share your knowledge with the community</p>
          </div>

          <Card className="mb-6 md:mb-8">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Submission Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4">
              <ul className="list-disc list-inside space-y-2 text-sm md:text-base text-muted-foreground">
                <li>Provide accurate book information including title, author, and description</li>
                <li>Include a valid cover image URL for better presentation</li>
                <li>Ensure the book content aligns with our community values</li>
                <li>Your submission will be reviewed by an admin before appearing in the collection</li>
                <li>You can edit your book up to 3 times after submission</li>
              </ul>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button
              onClick={() => setFormOpen(true)}
              size="lg"
              className="gap-2 w-full sm:w-auto"
            >
              <Upload className="h-5 w-5" />
              Start Upload
            </Button>
          </div>

          <BookForm
            open={formOpen}
            onOpenChange={setFormOpen}
            onSubmit={handleSubmit}
            mode="submit"
          />
        </div>
      </div>
    </div>
  );
}
