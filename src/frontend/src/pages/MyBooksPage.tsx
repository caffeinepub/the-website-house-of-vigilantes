import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetMyBooks, useUpdateBook, useDeleteBook, useRequestMoreEdits } from '../hooks/useQueries';
import type { Book } from '../backend';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Edit, Trash2, AlertCircle, BookOpen, ArrowLeft } from 'lucide-react';
import BookForm from '../components/BookForm';
import RequestMoreEditsDialog from '../components/RequestMoreEditsDialog';
import AuthPrompt from '../components/AuthPrompt';
import { toast } from 'sonner';
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

export default function MyBooksPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: books, isLoading } = useGetMyBooks();
  const updateBook = useUpdateBook();
  const deleteBook = useDeleteBook();
  const requestEdits = useRequestMoreEdits();

  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deletingIsbn, setDeletingIsbn] = useState<string | null>(null);
  const [requestEditsBook, setRequestEditsBook] = useState<Book | null>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const isAuthenticated = !!identity;

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-6 bg-vangogh-blue/10 rounded-full">
              <BookOpen className="h-16 w-16 text-vangogh-blue" />
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
            Authentication Required
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Please log in to view and manage your uploaded books.
          </p>
          <Button
            onClick={() => setShowAuthPrompt(true)}
            className="bg-vangogh-blue hover:bg-vangogh-blue/90 text-white rounded-full px-8"
          >
            Log In to Continue
          </Button>
        </div>
        <AuthPrompt
          open={showAuthPrompt}
          onOpenChange={setShowAuthPrompt}
          message="Please log in to view and manage your uploaded books, track their approval status, and make edits."
        />
      </div>
    );
  }

  const handleEdit = (book: Book) => {
    setEditingBook(book);
  };

  const handleDelete = async (isbn: string) => {
    try {
      await deleteBook.mutateAsync(isbn);
      toast.success('Book deleted successfully');
      setDeletingIsbn(null);
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete book');
    }
  };

  const handleUpdateBook = async (book: Book) => {
    if (!editingBook) return;
    try {
      await updateBook.mutateAsync({ isbn: editingBook.isbn, book });
      toast.success('Book updated successfully');
      setEditingBook(null);
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error(error.message || 'Failed to update book');
    }
  };

  const handleRequestMoreEdits = async (message?: string) => {
    if (!requestEditsBook) return;
    try {
      await requestEdits.mutateAsync({
        isbn: requestEditsBook.isbn,
        message: message || undefined,
      });
      toast.success('Edit request submitted successfully');
      setRequestEditsBook(null);
    } catch (error: any) {
      console.error('Request edits error:', error);
      toast.error(error.message || 'Failed to submit edit request');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12">
        <Skeleton className="h-12 w-48 mb-8" />
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: '/home' })}
        className="mb-6 md:mb-8 gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Button>

      <div className="mb-6 md:mb-8">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">My Books</h1>
        <p className="text-muted-foreground text-sm md:text-base">Manage your uploaded books and track their status</p>
      </div>

      {!books || books.length === 0 ? (
        <Card className="border-2 border-vangogh-yellow/30 rounded-3xl">
          <CardContent className="py-12 md:py-16 text-center">
            <BookOpen className="h-12 w-12 md:h-16 md:w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg md:text-xl text-muted-foreground mb-4">
              You haven't uploaded any books yet
            </p>
            <Button
              onClick={() => navigate({ to: '/upload' })}
              className="bg-vangogh-blue hover:bg-vangogh-blue/90 text-white rounded-full"
            >
              Upload Your First Book
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {books.map((book) => (
            <Card key={book.isbn} className="border-2 border-vangogh-yellow/30 rounded-3xl">
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex gap-3 md:gap-4 flex-1 w-full">
                    <img
                      src={book.coverImageUrl || '/assets/generated/placeholder-cover.dim_400x600.png'}
                      alt={book.title}
                      className="w-16 h-24 md:w-20 md:h-28 object-cover rounded shadow-book shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = '/assets/generated/placeholder-cover.dim_400x600.png';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <CardTitle className="font-serif text-lg md:text-xl">{book.title}</CardTitle>
                        <Badge
                          variant={
                            book.approvalStatus.__kind__ === 'approved'
                              ? 'default'
                              : book.approvalStatus.__kind__ === 'rejected'
                              ? 'destructive'
                              : 'secondary'
                          }
                          className="text-xs"
                        >
                          {book.approvalStatus.__kind__ === 'approved'
                            ? 'Approved'
                            : book.approvalStatus.__kind__ === 'rejected'
                            ? 'Rejected'
                            : 'Pending'}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-2 text-sm md:text-base">by {book.author}</p>
                      <p className="text-xs md:text-sm text-muted-foreground mb-2">
                        ISBN: {book.isbn} • {Number(book.pageCount)} pages
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Edits used: {Number(book.editCount)} / 3
                      </p>
                      {book.approvalStatus.__kind__ === 'rejected' && (
                        <div className="mt-2 p-2 bg-destructive/10 rounded-lg">
                          <p className="text-xs text-destructive flex items-start gap-1">
                            <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                            <span>
                              Rejection reason: {book.approvalStatus.rejected || 'No reason provided'}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <Button
                      onClick={() => handleEdit(book)}
                      disabled={Number(book.editCount) >= 3}
                      size="sm"
                      variant="outline"
                      className="gap-1 flex-1 md:flex-initial"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </Button>
                    {Number(book.editCount) >= 3 && (
                      <Button
                        onClick={() => setRequestEditsBook(book)}
                        size="sm"
                        variant="outline"
                        className="gap-1 flex-1 md:flex-initial"
                      >
                        Request More Edits
                      </Button>
                    )}
                    <Button
                      onClick={() => setDeletingIsbn(book.isbn)}
                      size="sm"
                      variant="outline"
                      className="gap-1 text-destructive hover:bg-destructive hover:text-white flex-1 md:flex-initial"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Book Dialog */}
      {editingBook && (
        <BookForm
          open={!!editingBook}
          onOpenChange={(open) => !open && setEditingBook(null)}
          mode="edit"
          initialBook={editingBook}
          onSubmit={handleUpdateBook}
        />
      )}

      {/* Request More Edits Dialog */}
      {requestEditsBook && (
        <RequestMoreEditsDialog
          open={!!requestEditsBook}
          onOpenChange={(open) => !open && setRequestEditsBook(null)}
          onSubmit={handleRequestMoreEdits}
          bookTitle={requestEditsBook.title}
          editCount={Number(requestEditsBook.editCount)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingIsbn} onOpenChange={() => setDeletingIsbn(null)}>
        <AlertDialogContent className="rounded-3xl border-2 border-vangogh-yellow/30 max-w-[90vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Book</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this book? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="rounded-full w-full sm:w-auto">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingIsbn && handleDelete(deletingIsbn)}
              className="bg-destructive hover:bg-destructive/90 text-white rounded-full w-full sm:w-auto"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
