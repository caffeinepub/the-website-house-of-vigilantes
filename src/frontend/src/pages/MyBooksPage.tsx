import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetMyBooks, useUpdateBook, useDeleteBook } from '../hooks/useQueries';
import type { Book } from '../backend';
import BookForm from '../components/BookForm';
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
import { Shield, Pencil, Trash2, BookOpen, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function MyBooksPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: books, isLoading } = useGetMyBooks();
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
            Please log in to view your books.
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
      return <Badge variant="default" className="gap-1"><CheckCircle className="h-3 w-3" /> Approved</Badge>;
    } else if (status.__kind__ === 'pending') {
      return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Pending Review</Badge>;
    } else {
      return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-bold text-foreground mb-2">My Books</h1>
          <p className="text-muted-foreground">Manage your uploaded books</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        ) : books && books.length > 0 ? (
          <div className="grid gap-4">
            {books.map((book) => {
              const remainingEdits = 3 - Number(book.editCount);
              const canEdit = remainingEdits > 0;

              return (
                <Card key={book.isbn}>
                  <CardHeader>
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex gap-4 flex-1">
                        <img
                          src={book.coverImageUrl || '/assets/generated/placeholder-cover.dim_400x600.png'}
                          alt={book.title}
                          className="w-20 h-28 object-cover rounded shadow-book cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => navigate({ to: '/book/$isbn', params: { isbn: book.isbn } })}
                        />
                        <div className="flex-1">
                          <div className="flex items-start gap-2 mb-2">
                            <CardTitle className="font-serif text-xl">{book.title}</CardTitle>
                            {getStatusBadge(book.approvalStatus)}
                          </div>
                          <p className="text-muted-foreground mb-2">by {book.author}</p>
                          <p className="text-sm text-muted-foreground mb-2">
                            ISBN: {book.isbn} • Published: {Number(book.publicationYear)}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {remainingEdits} edit{remainingEdits === 1 ? '' : 's'} remaining
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditBook(book)}
                          disabled={!canEdit}
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
                  {book.description && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">{book.description}</p>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg mb-4">You haven't uploaded any books yet.</p>
              <Button onClick={() => navigate({ to: '/upload' })}>
                Upload Your First Book
              </Button>
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
                This action cannot be undone. This will permanently delete your book from the collection.
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
    </div>
  );
}
