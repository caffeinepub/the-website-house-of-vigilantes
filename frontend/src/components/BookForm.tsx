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
  const [summaryText, setSummaryText] = useState('');
  const [moodTags, setMoodTags] = useState('');
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
      setSummaryText('');
      setMoodTags('');
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
      setSummaryText('');
      setMoodTags('');
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
      let pdfUrl = formData.pdfFileUrl;
      if (fileData) {
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

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm md:text-base">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Book description"
              required
              disabled={!canEdit}
              rows={3}
              className="text-sm md:text-base resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="summaryText" className="text-sm md:text-base">Summary Text (Optional)</Label>
            <Textarea
              id="summaryText"
              value={summaryText}
              onChange={(e) => setSummaryText(e.target.value)}
              placeholder="AI-generated summary placeholder - enter manual summary or leave empty"
              disabled={!canEdit}
              rows={3}
              className="text-sm md:text-base resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="moodTags" className="text-sm md:text-base">Mood Tags (Optional)</Label>
            <Input
              id="moodTags"
              value={moodTags}
              onChange={(e) => setMoodTags(e.target.value)}
              placeholder="e.g., inspiring, suspenseful, heartwarming"
              disabled={!canEdit}
              className="text-sm md:text-base"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="genre" className="text-sm md:text-base">Genre *</Label>
              <Select
                value={formData.genre}
                onValueChange={(value) => setFormData({ ...formData, genre: value })}
                disabled={!canEdit}
              >
                <SelectTrigger className="text-sm md:text-base">
                  <SelectValue placeholder="Select genre" />
                </SelectTrigger>
                <SelectContent>
                  {GENRES.map((genre) => (
                    <SelectItem key={genre} value={genre}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="publicationYear" className="text-sm md:text-base">Year *</Label>
              <Input
                id="publicationYear"
                type="number"
                value={Number(formData.publicationYear)}
                onChange={(e) => setFormData({ ...formData, publicationYear: BigInt(e.target.value) })}
                placeholder="2024"
                required
                disabled={!canEdit}
                className="text-sm md:text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pageCount" className="text-sm md:text-base">Pages *</Label>
              <Input
                id="pageCount"
                type="number"
                value={Number(formData.pageCount)}
                onChange={(e) => setFormData({ ...formData, pageCount: BigInt(e.target.value) })}
                placeholder="0"
                required
                disabled={!canEdit}
                className="text-sm md:text-base"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="isbn" className="text-sm md:text-base">ISBN *</Label>
              <Input
                id="isbn"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                placeholder="978-0-123456-78-9"
                required
                disabled={mode === 'edit' || !canEdit}
                className="text-sm md:text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coverImageUrl" className="text-sm md:text-base">Cover URL</Label>
              <Input
                id="coverImageUrl"
                value={formData.coverImageUrl}
                onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                placeholder="https://..."
                disabled={!canEdit}
                className="text-sm md:text-base"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm md:text-base">PDF File (Optional)</Label>
            {!file ? (
              <Card
                className="border-2 border-dashed border-vangogh-blue/30 hover:border-vangogh-blue/50 transition-colors cursor-pointer"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col items-center justify-center text-center">
                    <Upload className="h-10 w-10 text-vangogh-blue mb-3" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Drag and drop your PDF file here, or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Maximum file size: 1GB
                    </p>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileInputChange}
                      className="hidden"
                      id="pdf-upload"
                      disabled={!canEdit}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('pdf-upload')?.click()}
                      disabled={!canEdit}
                      className="rounded-full"
                    >
                      Select PDF File
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-vangogh-blue/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-vangogh-blue" />
                      <div>
                        <p className="text-sm font-medium">{fileName}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(fileSize)}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={removeFile}
                      disabled={!canEdit}
                      className="hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
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

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !canEdit}
              className="bg-vangogh-blue hover:bg-vangogh-blue/90 text-white rounded-full"
            >
              {isSubmitting ? 'Saving...' : mode === 'submit' ? 'Submit' : mode === 'create' ? 'Add Book' : 'Update Book'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
