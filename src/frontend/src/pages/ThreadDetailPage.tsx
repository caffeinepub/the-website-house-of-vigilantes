import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ThreadDetailPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-vangogh-blue/5 to-vangogh-yellow/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/discussions' })}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Discussions
        </Button>

        <div className="bg-card rounded-3xl border-2 border-vangogh-yellow/30 p-12 text-center shadow-vangogh-glow">
          <h2 className="text-2xl font-serif font-bold text-vangogh-blue mb-4">
            Thread Detail Coming Soon
          </h2>
          <p className="text-muted-foreground">
            Backend support for discussion threads is being implemented.
          </p>
        </div>
      </div>
    </div>
  );
}
