import { useState } from 'react';
import { useGetMyBooks, useDeleteBook } from '../hooks/useQueries';
import { useGetBookAverageRating } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, BarChart3, Trash2, Star } from 'lucide-react';
import BookForm from './BookForm';
import { toast } from 'sonner';
import type { Book } from '../backend';
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

interface AuthorBookManagerProps {
  onSelectBook: (isbn: string | null) => void;
}

export default function AuthorBookManager({ onSelectBook }: AuthorBookManagerProps) {
  const { data: books = [], isLoading } = useGetMyBooks();
  const deleteBook = useDeleteBook();
  const [showBookForm, setShowBookForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deleteIsbn, setDeleteIsbn] = useState<string | null>(null);

  const handleAddBook = () => {
    setEditingBook(null);
    setShowBookForm(true);
  };

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    setShowBookForm(true);
  };

  const handleDeleteBook = async (isbn: string) => {
    try {
      await deleteBook.mutateAsync(isbn);
      toast.success('Book deleted successfully');
      setDeleteIsbn(null);
    } catch (error) {
      toast.error('Failed to delete book');
      console.error('Delete error:', error);
    }
  };

  const handleViewAnalytics = (isbn: string) => {
    onSelectBook(isbn);
    // Switch to analytics tab - parent component handles this
    const analyticsTab = document.querySelector('[value="analytics"]') as HTMLButtonElement;
    analyticsTab?.click();
  };

  const handleFormSubmit = async () => {
    setShowBookForm(false);
    setEditingBook(null);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-vangogh-blue"></div>
        <p className="mt-4 text-muted-foreground">Loading your books...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Add Book Button */}
      <div className="mb-6">
        <Button
          onClick={handleAddBook}
          className="bg-vangogh-blue hover:bg-vangogh-blue/90 text-white rounded-full px-6 py-6 text-lg shadow-vangogh-glow"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add / Upload Book
        </Button>
      </div>

      {/* Books Grid */}
      {books.length === 0 ? (
        <Card className="border-2 border-vangogh-yellow/30 rounded-3xl">
          <CardContent className="py-12 text-center">
            <Plus className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground mb-4">
              No books yet
            </p>
            <p className="text-sm text-muted-foreground">
              Click "Add / Upload Book" to get started
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {books.map((book) => (
            <BookCard
              key={book.isbn}
              book={book}
              onEdit={() => handleEditBook(book)}
              onDelete={() => setDeleteIsbn(book.isbn)}
              onViewAnalytics={() => handleViewAnalytics(book.isbn)}
            />
          ))}
        </div>
      )}

      {/* Book Form Dialog */}
      {showBookForm && (
        <BookForm
          open={showBookForm}
          onOpenChange={setShowBookForm}
          mode={editingBook ? 'edit' : 'submit'}
          initialBook={editingBook || undefined}
          onSubmit={handleFormSubmit}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteIsbn} onOpenChange={() => setDeleteIsbn(null)}>
        <AlertDialogContent className="rounded-3xl border-2 border-vangogh-yellow/30">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Book</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this book? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteIsbn && handleDeleteBook(deleteIsbn)}
              className="bg-destructive hover:bg-destructive/90 text-white rounded-full"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function BookCard({
  book,
  onEdit,
  onDelete,
  onViewAnalytics,
}: {
  book: Book;
  onEdit: () => void;
  onDelete: () => void;
  onViewAnalytics: () => void;
}) {
  const { data: avgRating } = useGetBookAverageRating(book.isbn);

  // Mock data for reads and trending
  const mockReads = Math.floor(Math.random() * 1000);
  const mockTrendingPosition = Math.floor(Math.random() * 50) + 1;

  return (
    <Card className="border-2 border-vangogh-yellow/30 rounded-3xl overflow-hidden hover:shadow-vangogh-glow transition-shadow">
      <div className="flex gap-4 p-4">
        {/* Book Cover */}
        <div className="flex-shrink-0">
          <img
            src={book.coverImageUrl || '/assets/generated/placeholder-cover.dim_400x600.png'}
            alt={book.title}
            className="w-24 h-36 object-cover rounded-xl shadow-md"
            onError={(e) => {
              e.currentTarget.src = '/assets/generated/placeholder-cover.dim_400x600.png';
            }}
          />
        </div>

        {/* Book Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-serif font-bold text-lg text-vangogh-blue mb-1 truncate">
            {book.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-2">
            by {book.author}
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-3 mb-3 text-sm">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-vangogh-gold fill-vangogh-gold" />
              <span className="font-medium">
                {avgRating ? avgRating.toFixed(1) : '0.0'}
              </span>
            </div>
            <div className="text-muted-foreground">
              {mockReads} reads
            </div>
            <div className="text-muted-foreground">
              #{mockTrendingPosition} trending
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={onEdit}
              size="sm"
              variant="outline"
              className="rounded-full text-xs"
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
            <Button
              onClick={onViewAnalytics}
              size="sm"
              variant="outline"
              className="rounded-full text-xs"
            >
              <BarChart3 className="h-3 w-3 mr-1" />
              Analytics
            </Button>
            <Button
              onClick={onDelete}
              size="sm"
              variant="outline"
              className="rounded-full text-xs text-destructive hover:bg-destructive hover:text-white"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
