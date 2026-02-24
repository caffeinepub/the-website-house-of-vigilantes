import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, GripVertical, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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

interface Series {
  id: string;
  name: string;
  description: string;
  books: string[]; // Book ISBNs
  readNextEnabled: boolean;
}

export default function AuthorSeriesManager() {
  // Frontend-only state until backend supports series
  const [series, setSeries] = useState<Series[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingSeries, setEditingSeries] = useState<Series | null>(null);
  const [deletingSeriesId, setDeletingSeriesId] = useState<string | null>(null);

  const handleCreateSeries = (newSeries: Omit<Series, 'id'>) => {
    const series: Series = {
      ...newSeries,
      id: Date.now().toString(),
    };
    setSeries(prev => [...prev, series]);
    toast.success('Series created successfully');
    setShowCreateDialog(false);
  };

  const handleUpdateSeries = (updatedSeries: Series) => {
    setSeries(prev => prev.map(s => s.id === updatedSeries.id ? updatedSeries : s));
    toast.success('Series updated successfully');
    setEditingSeries(null);
  };

  const handleDeleteSeries = (id: string) => {
    setSeries(prev => prev.filter(s => s.id !== id));
    toast.success('Series deleted successfully');
    setDeletingSeriesId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-serif font-bold text-vangogh-blue">
            Series Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Organize your books into series and define reading order
          </p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="bg-vangogh-blue hover:bg-vangogh-blue/90 text-white rounded-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Series
        </Button>
      </div>

      {/* Series List */}
      {series.length === 0 ? (
        <Card className="border-2 border-vangogh-yellow/30 rounded-3xl">
          <CardContent className="py-12 text-center">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground mb-2">
              No series yet
            </p>
            <p className="text-sm text-muted-foreground">
              Create a series to group your books and define reading order
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {series.map((s) => (
            <Card key={s.id} className="border-2 border-vangogh-yellow/30 rounded-3xl">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-serif text-vangogh-blue">
                      {s.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {s.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setEditingSeries(s)}
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => setDeletingSeriesId(s.id)}
                      size="sm"
                      variant="outline"
                      className="rounded-full text-destructive hover:bg-destructive hover:text-white"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {s.books.length} book{s.books.length !== 1 ? 's' : ''} in series
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${s.readNextEnabled ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                      {s.readNextEnabled ? 'Read Next Enabled' : 'Read Next Disabled'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground italic">
        * Series data is stored locally until backend integration is added.
      </p>

      {/* Create/Edit Dialog */}
      <SeriesFormDialog
        open={showCreateDialog || !!editingSeries}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            setEditingSeries(null);
          }
        }}
        series={editingSeries}
        onSubmit={(data) => {
          if (editingSeries) {
            handleUpdateSeries({ ...data, id: editingSeries.id });
          } else {
            handleCreateSeries(data);
          }
        }}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingSeriesId} onOpenChange={() => setDeletingSeriesId(null)}>
        <AlertDialogContent className="rounded-3xl border-2 border-vangogh-yellow/30">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Series</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this series? Books will not be deleted, only the series grouping.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingSeriesId && handleDeleteSeries(deletingSeriesId)}
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

function SeriesFormDialog({
  open,
  onOpenChange,
  series,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  series: Series | null;
  onSubmit: (data: Omit<Series, 'id'>) => void;
}) {
  const [name, setName] = useState(series?.name || '');
  const [description, setDescription] = useState(series?.description || '');
  const [readNextEnabled, setReadNextEnabled] = useState(series?.readNextEnabled || false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter a series name');
      return;
    }
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      books: series?.books || [],
      readNextEnabled,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl border-2 border-vangogh-yellow/30">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif">
              {series ? 'Edit Series' : 'Create New Series'}
            </DialogTitle>
            <DialogDescription>
              {series ? 'Update series information' : 'Create a new series to group your books'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Series Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., The Chronicles of..."
                className="rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the series..."
                className="rounded-2xl min-h-[100px]"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="readNext"
                checked={readNextEnabled}
                onChange={(e) => setReadNextEnabled(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="readNext" className="cursor-pointer">
                Enable "Read Next" prompts between books
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-vangogh-blue hover:bg-vangogh-blue/90 text-white rounded-full"
            >
              {series ? 'Update' : 'Create'} Series
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
