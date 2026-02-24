import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetPendingSubmissions, useGetCallerUserRole, useApproveBookSubmission } from '../hooks/useQueries';
import { UserRole } from '../backend';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Shield, AlertCircle, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminReviewPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: roleData, isLoading: roleLoading } = useGetCallerUserRole();
  const { data: submissions, isLoading: submissionsLoading } = useGetPendingSubmissions();
  const approveSubmission = useApproveBookSubmission();

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedIsbn, setSelectedIsbn] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const isAuthenticated = !!identity;
  const isAdmin = roleData?.systemRole === UserRole.admin;

  useEffect(() => {
    if (!roleLoading && !isAdmin && isAuthenticated) {
      toast.error('Access denied. Admin privileges required.');
      navigate({ to: '/home' });
    }
  }, [isAdmin, roleLoading, isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Please log in to access the admin review panel.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (roleLoading) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12">
        <Skeleton className="h-12 w-64 mb-8" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12">
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
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedIsbn) return;

    try {
      await approveSubmission.mutateAsync({
        isbn: selectedIsbn,
        isApproved: false,
        rejectionReason: rejectionReason.trim() || 'No reason provided',
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
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: '/admin' })}
        className="mb-6 md:mb-8 gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Admin Panel
      </Button>

      <div className="mb-6 md:mb-8">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">Review Submissions</h1>
        <p className="text-muted-foreground text-sm md:text-base">Approve or reject pending book submissions</p>
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
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex gap-3 md:gap-4 flex-1 w-full">
                    <img
                      src={submission.coverImageUrl || '/assets/generated/placeholder-cover.dim_400x600.png'}
                      alt={submission.title}
                      className="w-16 h-24 md:w-20 md:h-28 object-cover rounded shadow-book shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <CardTitle className="font-serif text-lg md:text-xl">{submission.title}</CardTitle>
                        <Badge variant="secondary" className="text-xs">Pending</Badge>
                      </div>
                      <p className="text-muted-foreground mb-2 text-sm md:text-base">by {submission.author}</p>
                      <p className="text-xs md:text-sm text-muted-foreground mb-2">
                        ISBN: {submission.isbn} • Published: {Number(submission.publicationYear)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Submitted by: {submission.uploaderId.toString().slice(0, 10)}...
                      </p>
                      {submission.description && (
                        <p className="text-xs md:text-sm text-muted-foreground mt-2 line-clamp-2">
                          {submission.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <Button
                      onClick={() => handleApprove(submission.isbn)}
                      disabled={approveSubmission.isPending}
                      className="gap-1 bg-green-600 hover:bg-green-700 flex-1 md:flex-initial"
                      size="sm"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Approve</span>
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleRejectClick(submission.isbn)}
                      disabled={approveSubmission.isPending}
                      className="gap-1 flex-1 md:flex-initial"
                      size="sm"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Reject</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 md:py-16">
            <CheckCircle className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-base md:text-lg">No pending submissions to review.</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Book Submission</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason (optional)</Label>
              <Textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Provide a reason for rejection..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={approveSubmission.isPending}
              className="w-full sm:w-auto"
            >
              {approveSubmission.isPending ? 'Rejecting...' : 'Reject Book'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
