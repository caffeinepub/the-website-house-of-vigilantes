import { useGetAllBooks } from '../hooks/useQueries';
import BookGrid from '../components/BookGrid';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function HomePage() {
  const { data: books, isLoading, error } = useGetAllBooks();

  return (
    <div className="min-h-screen bg-starry-background">
      {/* Starry Night Hero Section */}
      <div className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
        <img
          src="/assets/generated/starry-night-hero.dim_1200x600.png"
          alt="The House of Vigilantes"
          className="w-full h-full object-cover animate-subtle-float"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-starry-background/20 via-transparent to-starry-background" />
        
        {/* Swirling overlay effect */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-starry-primary/10 to-starry-background/40" />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-6 px-4 max-w-4xl mx-auto">
            <h1 className="starry-heading text-starry-secondary drop-shadow-2xl animate-fade-in">
              THE HOUSE OF VIGILANTES
            </h1>
            <div className="space-y-4 animate-fade-in-delay">
              <p className="text-lg md:text-xl text-starry-accent font-serif leading-relaxed drop-shadow-lg">
                Vincent van Gogh's masterpiece "The Starry Night" (1889) captures the view from his asylum room window at Saint-Rémy-de-Provence, 
                just before sunrise, with an idealized village below.
              </p>
              <p className="text-base md:text-lg text-starry-accent/90 font-serif leading-relaxed drop-shadow-lg max-w-2xl mx-auto">
                The painting's swirling sky, luminous stars, and cypress tree reaching toward the heavens express van Gogh's 
                turbulent emotions and his profound connection to nature and the cosmos.
              </p>
            </div>
          </div>
        </div>

        {/* Decorative flowing elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-starry-secondary/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-starry-primary/10 rounded-full blur-3xl animate-pulse-slow-delay" />
      </div>

      {/* Books Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h2 className="font-serif text-4xl font-bold text-starry-secondary mb-4 tracking-wide">
            Our Collection
          </h2>
          <p className="text-starry-accent text-lg">
            Browse through our curated collection of literary works
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 rounded-3xl border-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load books. Please try again later.
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[2/3] w-full rounded-3xl" />
                <Skeleton className="h-6 w-3/4 rounded-full" />
                <Skeleton className="h-4 w-1/2 rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <BookGrid books={books || []} />
        )}
      </section>
    </div>
  );
}
