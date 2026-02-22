import { useState, useEffect } from 'react';
import type { Book } from '../backend';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface BookFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (book: Book) => Promise<void>;
  initialBook?: Book;
  mode: 'create' | 'edit' | 'submit';
}

export default function BookForm({ open, onOpenChange, onSubmit, initialBook, mode }: BookFormProps) {
  const [formData, setFormData] = useState<Book>({
    title: '',
    author: '',
    coverImageUrl: '',
    description: '',
    publicationYear: BigInt(new Date().getFullYear()),
    isbn: '',
    uploaderId: null as any,
    approvalStatus: { __kind__: 'pending', pending: null },
    editCount: BigInt(0),
    createdAt: BigInt(Date.now() * 1000000),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialBook) {
      setFormData(initialBook);
    } else {
      setFormData({
        title: '',
        author: '',
        coverImageUrl: '',
        description: '',
        publicationYear: BigInt(new Date().getFullYear()),
        isbn: '',
        uploaderId: null as any,
        approvalStatus: { __kind__: 'pending', pending: null },
        editCount: BigInt(0),
        createdAt: BigInt(Date.now() * 1000000),
      });
    }
  }, [initialBook, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.author.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      const successMessage = 
        mode === 'submit' ? 'Book submitted for approval!' :
        mode === 'create' ? 'Book added successfully!' : 
        'Book updated successfully!';
      toast.success(successMessage);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error submitting book:', error);
      toast.error(error.message || 'Failed to save book. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const remainingEdits = initialBook ? 3 - Number(initialBook.editCount) : 3;
  const canEdit = mode !== 'edit' || remainingEdits > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            {mode === 'submit' ? 'Submit Book for Approval' : mode === 'create' ? 'Add New Book' : 'Edit Book'}
          </DialogTitle>
        </DialogHeader>

        {mode === 'edit' && initialBook && (
          <Alert className={remainingEdits === 0 ? 'border-destructive' : ''}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {remainingEdits > 0 
                ? `You have ${remainingEdits} edit${remainingEdits === 1 ? '' : 's'} remaining for this book.`
                : 'You have reached the edit limit for this book. No more edits are allowed.'}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Book title"
                required
                disabled={!canEdit}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Author *</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="Author name"
                required
                disabled={!canEdit}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="isbn">ISBN</Label>
              <Input
                id="isbn"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                placeholder="ISBN number (optional)"
                disabled={mode === 'edit' || !canEdit}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Publication Year</Label>
              <Input
                id="year"
                type="number"
                value={Number(formData.publicationYear)}
                onChange={(e) => setFormData({ ...formData, publicationYear: BigInt(e.target.value) })}
                placeholder="Year"
                min="1000"
                max={new Date().getFullYear() + 10}
                disabled={!canEdit}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverUrl">Cover Image URL</Label>
            <Input
              id="coverUrl"
              value={formData.coverImageUrl}
              onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
              placeholder="https://example.com/cover.jpg"
              type="url"
              disabled={!canEdit}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Book description"
              rows={5}
              disabled={!canEdit}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !canEdit}>
              {isSubmitting 
                ? 'Saving...' 
                : mode === 'submit' 
                  ? 'Submit for Approval' 
                  : mode === 'create' 
                    ? 'Add Book' 
                    : 'Update Book'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
