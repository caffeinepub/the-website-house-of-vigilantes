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
      <div className="container mx-auto px-4 py-12">
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
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="h-12 w-64 mb-8" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isFetched && !userProfile) {
    return (
      <div className="container mx-auto px-4 py-12">
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
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <CardTitle className="font-serif text-3xl">Book Submitted Successfully!</CardTitle>
            <CardDescription className="text-base mt-2">
              Your book has been submitted for admin review. You'll be able to see it in your books once it's approved.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button onClick={() => navigate({ to: '/my-books' })} className="w-full">
              View My Books
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setSubmitted(false);
                setFormOpen(true);
              }} 
              className="w-full"
            >
              Submit Another Book
            </Button>
            <Button variant="ghost" onClick={() => navigate({ to: '/' })} className="w-full">
              Back to Collection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="font-serif text-4xl font-bold text-foreground mb-3">Upload Your Book</h1>
            <p className="text-muted-foreground text-lg">
              Share your literary work with the community
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="font-serif text-2xl">Submission Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>• Your book will be reviewed by an admin before appearing on the site</p>
              <p>• Once approved, you can edit your book details up to 3 times</p>
              <p>• Both you and the admin can delete your book at any time</p>
              <p>• Please ensure all information is accurate before submitting</p>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button 
              size="lg" 
              onClick={() => setFormOpen(true)}
              className="gap-2 px-8"
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
