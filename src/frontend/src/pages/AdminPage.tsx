import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetAllBooks, useIsCallerAdmin, useUpdateBook, useDeleteBook } from '../hooks/useQueries';
import type { Book } from '../backend';
import BookForm from '../components/BookForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { Pencil, Trash2, AlertCircle, Shield, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();
  const { data: books, isLoading: booksLoading } = useGetAllBooks();
  const updateBook = useUpdateBook();
  const deleteBook = useDeleteBook();

  const [formOpen, setFormOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<string | null>(null);

  const isAuthenticated = !!identity;

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Please log in to access the admin panel.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isAdminLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="h-12 w-64 mb-8" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Access denied. You do not have admin privileges.
          </AlertDescription>
        </Alert>
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

  const getStatusBadge = (status: Book['approvalStatus']) => {
    if (status.__kind__ === 'approved') {
      return <Badge variant="default">Approved</Badge>;
    } else if (status.__kind__ === 'pending') {
      return <Badge variant="secondary">Pending</Badge>;
    } else {
      return <Badge variant="destructive">Rejected</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-serif text-4xl font-bold text-foreground mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">Manage the book collection</p>
        </div>
        <Button onClick={() => navigate({ to: '/admin/review' })} className="gap-2">
          <ClipboardList className="h-4 w-4" />
          Review Submissions
        </Button>
      </div>

      {booksLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : books && books.length > 0 ? (
        <div className="grid gap-4">
          {books.map((book) => (
            <Card key={book.isbn}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <img
                      src={book.coverImageUrl || '/assets/generated/placeholder-cover.dim_400x600.png'}
                      alt={book.title}
                      className="w-20 h-28 object-cover rounded shadow-book"
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="font-serif text-xl">{book.title}</CardTitle>
                        {getStatusBadge(book.approvalStatus)}
                      </div>
                      <p className="text-muted-foreground mb-2">by {book.author}</p>
                      <p className="text-sm text-muted-foreground">
                        ISBN: {book.isbn} • Published: {Number(book.publicationYear)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Edits used: {Number(book.editCount)}/3
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditBook(book)}
                      className="gap-1"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(book.isbn)}
                      className="gap-1 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground text-lg">No books in the collection yet.</p>
          </CardContent>
        </Card>
      )}

      <BookForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        initialBook={selectedBook}
        mode="edit"
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the book from the collection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
