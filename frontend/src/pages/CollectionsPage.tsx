import { FolderHeart } from 'lucide-react';

export default function CollectionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-vangogh-blue/5 to-vangogh-yellow/5">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-vangogh-blue mb-2">
            Curated Collections
          </h1>
          <p className="text-muted-foreground">
            Discover themed book collections
          </p>
        </div>

        <div className="bg-card rounded-3xl border-2 border-vangogh-yellow/30 p-12 text-center shadow-vangogh-glow">
          <FolderHeart className="h-24 w-24 mx-auto text-vangogh-blue/30 mb-6" />
          <h2 className="text-2xl font-serif font-bold text-vangogh-blue mb-4">
            Collections Feature Coming Soon
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Backend support for curated collections is being implemented. Soon you'll be able to explore themed collections, mood-based spotlights, and genre showcases.
          </p>
        </div>
      </div>
    </div>
  );
}
