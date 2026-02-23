import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface HeroSectionProps {
  onSearch?: (query: string) => void;
}

export default function HeroSection({ onSearch }: HeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  return (
    <section className="relative overflow-hidden vangogh-texture">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-vangogh-blue/10 via-vangogh-gold/5 to-background" />
      
      {/* Content */}
      <div className="relative container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground">
              Welcome to Your Library
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover books tailored to your reading preferences
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for books, authors, or genres..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 h-14 text-base rounded-full border-2 border-vangogh-gold/30 focus:border-vangogh-gold bg-card/80 backdrop-blur-sm shadow-lg hover:shadow-vangogh-glow transition-all"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="rounded-full px-8 bg-gradient-to-r from-vangogh-blue to-vangogh-gold hover:from-vangogh-gold hover:to-vangogh-blue text-white font-semibold shadow-lg hover:shadow-vangogh-glow-lg transition-all"
              >
                Search
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
