import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Share2 } from 'lucide-react';
import { SiFacebook, SiX, SiLinkedin } from 'react-icons/si';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function CollectionDetailPage() {
  const navigate = useNavigate();

  const handleShare = () => {
    toast.info('Share functionality coming soon!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-vangogh-blue/5 to-vangogh-yellow/5">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/collections' })}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Collections
        </Button>

        <div className="bg-card rounded-3xl border-2 border-vangogh-yellow/30 p-8 md:p-12 shadow-vangogh-glow">
          <div className="text-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-vangogh-blue">
              Collection Detail Coming Soon
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Backend support for curated collections is being implemented.
            </p>

            {/* Share Buttons Placeholder */}
            <div className="pt-6">
              <p className="text-sm text-muted-foreground mb-4">Share this collection:</p>
              <div className="flex items-center justify-center gap-3">
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-full border-vangogh-blue/30 hover:bg-vangogh-blue/10"
                  onClick={handleShare}
                >
                  <SiFacebook className="h-5 w-5 text-[#1877F2]" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-full border-vangogh-blue/30 hover:bg-vangogh-blue/10"
                  onClick={handleShare}
                >
                  <SiX className="h-5 w-5" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-full border-vangogh-blue/30 hover:bg-vangogh-blue/10"
                  onClick={handleShare}
                >
                  <SiLinkedin className="h-5 w-5 text-[#0A66C2]" />
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full border-vangogh-blue/30 hover:bg-vangogh-blue/10"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Link
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
