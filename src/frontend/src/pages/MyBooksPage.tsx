import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetMyBooks, useUpdateBook, useDeleteBook, useRequestMoreEdits } from '../hooks/useQueries';
import type { Book } from '../backend';
import BookForm from '../components/BookForm';
import RequestMoreEditsDialog from '../components/RequestMoreEditsDialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Shield, Pencil, Trash2, BookOpen, Clock, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import AuthPrompt from '../components/AuthPrompt';

export default function MyBooksPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: books, isLoading } = useGetMyBooks();
  const updateBook = useUpdateBook();
  const deleteBook = useDeleteBook();
  const requestMoreEdits = useRequestMoreEdits();

  const [formOpen, setFormOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<string | null>(null);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [bookForRequest, setBookForRequest] = useState<Book | null>(null);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);

  const isAuthenticated = !!identity;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center space-y-6 px-4">
          <div className="flex justify-center">
            <div className="p-6 bg-primary/10 rounded-full">
              <BookOpen className="h-16 w-16 text-primary" />
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
            Login Required
          </h2>
          <p className="text-muted-foreground max-w-md">
            Please log in to view and manage your uploaded books.
          </p>
          <Button
            onClick={() => setAuthPromptOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8"
          >
            Log In to View My Books
          </Button>
        </div>
        <AuthPrompt
          open={authPromptOpen}
          onOpenChange={setAuthPromptOpen}
          message="Please log in to view and manage your uploaded books and submissions."
        />
      </div>
    );
  }

  const handleEditBook = (book: Book) => {
    setSelectedBook(book);
    setFormOpen(true);
  };

  const handleDeleteClick = (isbn: string) => {
    setBookToDelete(isbn);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!bookToDelete) return;

    try {
      await deleteBook.mutateAsync(bookToDelete);
      toast.success('Book deleted successfully!');
      setDeleteDialogOpen(false);
      setBookToDelete(null);
    } catch (error: any) {
      console.error('Error deleting book:', error);
      toast.error(error.message || 'Failed to delete book. Please try again.');
    }
  };

  const handleFormSubmit = async (book: Book) => {
    await updateBook.mutateAsync({ isbn: book.isbn, book });
  };

  const handleRequestMoreEdits = (book: Book) => {
    setBookForRequest(book);
    setRequestDialogOpen(true);
  };

  const handleRequestSubmit = async (message: string) => {
    if (!bookForRequest) return;

    try {
      await requestMoreEdits.mutateAsync({
        isbn: bookForRequest.isbn,
        message: message || null,
      });
      toast.success('Edit request submitted successfully! An admin will review your request.');
    } catch (error: any) {
      console.error('Error submitting request:', error);
      toast.error(error.message || 'Failed to submit request. Please try again.');
    }
  };

  const getStatusBadge = (status: Book['approvalStatus']) => {
    if (status.__kind__ === 'approved') {
      return <Badge variant="default" className="gap-1 text-xs"><CheckCircle className="h-3 w-3" /> Approved</Badge>;
    } else if (status.__kind__ === 'pending') {
      return <Badge variant="secondary" className="gap-1 text-xs"><Clock className="h-3 w-3" /> Pending</Badge>;
    } else {
      return <Badge variant="destructive" className="gap-1 text-xs"><XCircle className="h-3 w-3" /> Rejected</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-6 md:mb-8">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">My Books</h1>
          <p className="text-muted-foreground text-sm md:text-base">Manage your uploaded books</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 md:h-40 w-full" />
            ))}
          </div>
        ) : !books || books.length === 0 ? (
          <Card className="rounded-3xl border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 md:py-16 text-center">
              <BookOpen className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg md:text-xl font-semibold mb-2">No books yet</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-6 max-w-md">
                You haven't uploaded any books yet. Start sharing your work with the community!
              </p>
              <Button
                onClick={() => navigate({ to: '/upload' })}
                className="rounded-full w-full md:w-auto"
              >
                Upload Your First Book
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4 md:space-y-6">
            {books.map((book) => (
              <Card key={book.isbn} className="rounded-3xl border-2 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div className="flex-1">
                      <CardTitle className="font-serif text-xl md:text-2xl mb-2">{book.title}</CardTitle>
                      <p className="text-sm md:text-base text-muted-foreground">by {book.author}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {getStatusBadge(book.approvalStatus)}
                      {book.approvalStatus.__kind__ === 'approved' && (
                        <Badge variant="outline" className="text-xs">
                          Edits: {Number(book.editCount)}/3
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Genre:</span>
                        <span className="ml-2 font-medium">{book.genre}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Year:</span>
                        <span className="ml-2 font-medium">{book.publicationYear.toString()}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Pages:</span>
                        <span className="ml-2 font-medium">{book.pageCount.toString()}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">ISBN:</span>
                        <span className="ml-2 font-medium">{book.isbn}</span>
                      </div>
                    </div>
                  </div>

                  {book.approvalStatus.__kind__ === 'rejected' && (
                    <Alert variant="destructive" className="rounded-2xl">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Rejection Reason:</strong> {book.approvalStatus.rejected || 'No reason provided'}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    {book.approvalStatus.__kind__ === 'approved' && (
                      <>
                        {Number(book.editCount) < 3 ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditBook(book)}
                            className="rounded-full w-full sm:w-auto"
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit Book
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRequestMoreEdits(book)}
                            className="rounded-full w-full sm:w-auto"
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Request More Edits
                          </Button>
                        )}
                      </>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(book.isbn)}
                      className="rounded-full w-full sm:w-auto"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Book Form Dialog */}
      {selectedBook && (
        <BookForm
          open={formOpen}
          onOpenChange={setFormOpen}
          initialBook={selectedBook}
          onSubmit={handleFormSubmit}
          mode="edit"
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your book from the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="rounded-full bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Request More Edits Dialog */}
      {bookForRequest && (
        <RequestMoreEditsDialog
          open={requestDialogOpen}
          onOpenChange={setRequestDialogOpen}
          bookTitle={bookForRequest.title}
          editCount={Number(bookForRequest.editCount)}
          onSubmit={handleRequestSubmit}
        />
      )}
    </div>
  );
}
