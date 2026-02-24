import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { UsersRound } from 'lucide-react';
import AuthPrompt from '../components/AuthPrompt';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function SocialPage() {
  const { identity } = useInternetIdentity();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const isAuthenticated = !!identity;

  if (!isAuthenticated) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-background via-vangogh-blue/5 to-vangogh-yellow/5 flex items-center justify-center p-4">
          <div className="text-center">
            <UsersRound className="h-24 w-24 mx-auto text-vangogh-blue mb-6" />
            <h1 className="text-4xl font-serif font-bold text-vangogh-blue mb-4">
              Social Features
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Please log in to connect with other readers and authors
            </p>
            <Button
              onClick={() => setShowAuthPrompt(true)}
              className="bg-vangogh-blue hover:bg-vangogh-blue/90 text-white rounded-full px-8 py-6 text-lg"
            >
              Login to Continue
            </Button>
          </div>
        </div>
        <AuthPrompt
          open={showAuthPrompt}
          onOpenChange={setShowAuthPrompt}
          message="Please log in to access social features and connect with the community."
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-vangogh-blue/5 to-vangogh-yellow/5">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-vangogh-blue mb-2">
            Social Features
          </h1>
          <p className="text-muted-foreground">
            Connect with readers and authors
          </p>
        </div>

        <div className="bg-card rounded-3xl border-2 border-vangogh-yellow/30 p-12 text-center shadow-vangogh-glow">
          <UsersRound className="h-24 w-24 mx-auto text-vangogh-blue/30 mb-6" />
          <h2 className="text-2xl font-serif font-bold text-vangogh-blue mb-4">
            Social Features Coming Soon
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Backend support for social features is being implemented. Soon you'll be able to follow authors, connect with readers, and build your reading community.
          </p>
        </div>
      </div>
    </div>
  );
}
