import { useState, useEffect } from 'react';
import type { Book } from '../backend';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Upload, X, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { usePdfUpload } from '../hooks/usePdfUpload';

interface BookFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (book: Book) => Promise<void>;
  initialBook?: Book;
  mode: 'create' | 'edit' | 'submit';
}

const GENRES = [
  'Fiction',
  'Non-Fiction',
  'Science Fiction',
  'Fantasy',
  'Mystery',
  'Thriller',
  'Romance',
  'Historical',
  'Biography',
  'Self-Help',
  'Philosophy',
  'Science',
  'Technology',
  'Business',
  'Poetry',
  'Drama',
  'Other',
];

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
    genre: 'Fiction',
    editCount: BigInt(0),
    createdAt: BigInt(Date.now() * 1000000),
    pageCount: BigInt(0),
    pdfFileUrl: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    file,
    fileData,
    fileName,
    fileSize,
    error: pdfError,
    handleFileSelect,
    handleDrop,
    handleDragOver,
    removeFile,
    formatFileSize,
  } = usePdfUpload();

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
        genre: 'Fiction',
        editCount: BigInt(0),
        createdAt: BigInt(Date.now() * 1000000),
        pageCount: BigInt(0),
        pdfFileUrl: '',
      });
      removeFile();
    }
  }, [initialBook, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.author.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (Number(formData.pageCount) < 0) {
      toast.error('Page count must be a positive number');
      return;
    }

    setIsSubmitting(true);
    try {
      // For now, we'll store PDF as a data URL if uploaded
      // In production, this should use proper blob storage
      let pdfUrl = formData.pdfFileUrl;
      if (fileData) {
        // Create a new Uint8Array with ArrayBuffer to satisfy TypeScript
        const arrayBuffer = new ArrayBuffer(fileData.length);
        const uint8View = new Uint8Array(arrayBuffer);
        uint8View.set(fileData);
        const blob = new Blob([uint8View], { type: 'application/pdf' });
        pdfUrl = URL.createObjectURL(blob);
      }

      await onSubmit({ ...formData, pdfFileUrl: pdfUrl });
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

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl md:text-2xl">
            {mode === 'submit' ? 'Submit Book for Approval' : mode === 'create' ? 'Add New Book' : 'Edit Book'}
          </DialogTitle>
        </DialogHeader>

        {mode === 'edit' && initialBook && (
          <Alert className={remainingEdits === 0 ? 'border-destructive' : ''}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {remainingEdits > 0 
                ? `You have ${remainingEdits} edit${remainingEdits === 1 ? '' : 's'} remaining for this book.`
                : 'You have reached the edit limit for this book. No more edits are allowed.'}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm md:text-base">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Book title"
                required
                disabled={!canEdit}
                className="text-sm md:text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author" className="text-sm md:text-base">Author *</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="Author name"
                required
                disabled={!canEdit}
                className="text-sm md:text-base"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="isbn" className="text-sm md:text-base">ISBN</Label>
              <Input
                id="isbn"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                placeholder="ISBN number (optional)"
                disabled={mode === 'edit' || !canEdit}
                className="text-sm md:text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year" className="text-sm md:text-base">Publication Year</Label>
              <Input
                id="year"
                type="number"
                value={Number(formData.publicationYear)}
                onChange={(e) => setFormData({ ...formData, publicationYear: BigInt(e.target.value) })}
                placeholder="Year"
                min="1000"
                max={new Date().getFullYear() + 10}
                disabled={!canEdit}
                className="text-sm md:text-base"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="genre" className="text-sm md:text-base">Genre</Label>
              <Select
                value={formData.genre}
                onValueChange={(value) => setFormData({ ...formData, genre: value })}
                disabled={!canEdit}
              >
                <SelectTrigger id="genre" className="text-sm md:text-base">
                  <SelectValue placeholder="Select genre" />
                </SelectTrigger>
                <SelectContent>
                  {GENRES.map((genre) => (
                    <SelectItem key={genre} value={genre} className="text-sm md:text-base">
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pageCount" className="text-sm md:text-base">Page Count</Label>
              <Input
                id="pageCount"
                type="number"
                value={Number(formData.pageCount)}
                onChange={(e) => setFormData({ ...formData, pageCount: BigInt(Math.max(0, parseInt(e.target.value) || 0)) })}
                placeholder="Total pages"
                min="0"
                disabled={!canEdit}
                className="text-sm md:text-base"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverUrl" className="text-sm md:text-base">Cover Image URL</Label>
            <Input
              id="coverUrl"
              value={formData.coverImageUrl}
              onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
              placeholder="https://example.com/cover.jpg"
              type="url"
              disabled={!canEdit}
              className="text-sm md:text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm md:text-base">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Book description"
              rows={5}
              disabled={!canEdit}
              className="text-sm md:text-base"
            />
          </div>

          {/* PDF Upload Section */}
          <div className="space-y-2">
            <Label className="text-sm md:text-base">PDF File (Optional)</Label>
            <Alert className="mb-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Note: PDF upload is currently in development. You can upload a PDF, but full viewing functionality will be available soon.
              </AlertDescription>
            </Alert>
            {!file && !formData.pdfFileUrl ? (
              <Card
                className="border-2 border-dashed cursor-pointer hover:border-primary/50 transition-colors"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => !canEdit ? null : document.getElementById('pdf-upload')?.click()}
              >
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-sm font-medium mb-1">
                    {canEdit ? 'Click to upload or drag and drop' : 'PDF upload disabled'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF files only, up to 1GB
                  </p>
                  <input
                    id="pdf-upload"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileInputChange}
                    className="hidden"
                    disabled={!canEdit}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="h-8 w-8 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {fileName || 'Existing PDF'}
                      </p>
                      {fileSize > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(fileSize)}
                        </p>
                      )}
                    </div>
                  </div>
                  {canEdit && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile();
                        setFormData({ ...formData, pdfFileUrl: '' });
                      }}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
            {pdfError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">{pdfError}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !canEdit} className="w-full sm:w-auto">
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
