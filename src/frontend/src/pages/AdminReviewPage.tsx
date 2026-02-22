import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetPendingSubmissions, useApproveBookSubmission, useIsCallerAdmin } from '../hooks/useQueries';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Shield, CheckCircle, XCircle, AlertCircle, Inbox } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminReviewPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();
  const { data: submissions, isLoading: submissionsLoading } = useGetPendingSubmissions();
  const approveSubmission = useApproveBookSubmission();

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedIsbn, setSelectedIsbn] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const isAuthenticated = !!identity;

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Please log in to access the review panel.
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

  const handleApprove = async (isbn: string) => {
    try {
      await approveSubmission.mutateAsync({ isbn, isApproved: true });
      toast.success('Book approved successfully!');
    } catch (error: any) {
      console.error('Error approving book:', error);
      toast.error(error.message || 'Failed to approve book. Please try again.');
    }
  };

  const handleRejectClick = (isbn: string) => {
    setSelectedIsbn(isbn);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedIsbn) return;

    try {
      await approveSubmission.mutateAsync({ 
        isbn: selectedIsbn, 
        isApproved: false, 
        rejectionReason: rejectionReason.trim() || 'No reason provided' 
      });
      toast.success('Book rejected.');
      setRejectDialogOpen(false);
      setSelectedIsbn(null);
      setRejectionReason('');
    } catch (error: any) {
      console.error('Error rejecting book:', error);
      toast.error(error.message || 'Failed to reject book. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-serif text-4xl font-bold text-foreground mb-2">Review Submissions</h1>
            <p className="text-muted-foreground">Approve or reject pending book submissions</p>
          </div>
          <Button variant="outline" onClick={() => navigate({ to: '/admin' })}>
            Back to Admin
          </Button>
        </div>

        {submissionsLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        ) : submissions && submissions.length > 0 ? (
          <div className="grid gap-4">
            {submissions.map((submission) => (
              <Card key={submission.isbn}>
                <CardHeader>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex gap-4 flex-1">
                      <img
                        src={submission.coverImageUrl || '/assets/generated/placeholder-cover.dim_400x600.png'}
                        alt={submission.title}
                        className="w-24 h-36 object-cover rounded shadow-book"
                      />
                      <div className="flex-1">
                        <CardTitle className="font-serif text-2xl mb-2">{submission.title}</CardTitle>
                        <p className="text-muted-foreground mb-2 text-lg">by {submission.author}</p>
                        <p className="text-sm text-muted-foreground mb-3">
                          ISBN: {submission.isbn} • Published: {Number(submission.publicationYear)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Uploaded by: {submission.uploaderId.toString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApprove(submission.isbn)}
                        className="gap-1 bg-green-600 hover:bg-green-700"
                        disabled={approveSubmission.isPending}
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleRejectClick(submission.isbn)}
                        className="gap-1"
                        disabled={approveSubmission.isPending}
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {submission.description && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{submission.description}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Inbox className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg">No pending submissions to review.</p>
            </CardContent>
          </Card>
        )}

        <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reject Book Submission</AlertDialogTitle>
              <AlertDialogDescription>
                Please provide a reason for rejecting this book submission. This will help the author understand why their book was not approved.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Input
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                className="mt-2"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleRejectConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Reject Book
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
