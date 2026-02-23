import { useNavigate } from '@tanstack/react-router';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { Shield } from 'lucide-react';
import { useEffect } from 'react';

export default function AdminModerationPage() {
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate({ to: '/home' });
    }
  }, [isAdmin, adminLoading, navigate]);

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-vangogh-blue/5 to-vangogh-yellow/5 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-vangogh-blue mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-vangogh-blue/5 to-vangogh-yellow/5">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-vangogh-blue mb-2">
            Content Moderation
          </h1>
          <p className="text-muted-foreground">
            Review and manage flagged content
          </p>
        </div>

        <div className="bg-card rounded-3xl border-2 border-vangogh-yellow/30 p-12 text-center shadow-vangogh-glow">
          <Shield className="h-24 w-24 mx-auto text-vangogh-blue/30 mb-6" />
          <h2 className="text-2xl font-serif font-bold text-vangogh-blue mb-4">
            Moderation Feature Coming Soon
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Backend support for content moderation is being implemented. This feature will allow you to review flagged reviews, comments, and books.
          </p>
        </div>
      </div>
    </div>
  );
}
