import { Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const appIdentifier = typeof window !== 'undefined' 
    ? encodeURIComponent(window.location.hostname)
    : 'unknown-app';

  return (
    <footer className="border-t border-vangogh-yellow/20 bg-background/80 backdrop-blur-sm mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} THE HOUSE OF VIGILANTES. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
            Built with <Heart className="h-4 w-4 text-red-500 fill-red-500" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-vangogh-yellow hover:underline font-medium"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
