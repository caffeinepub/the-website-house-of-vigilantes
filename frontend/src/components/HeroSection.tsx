import React from 'react';
import { Search } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search functionality to be implemented
    console.log('Search:', searchQuery);
  };

  return (
    <div className="relative w-full bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 overflow-hidden">
      <div
        className="absolute inset-0 opacity-10 bg-cover bg-center"
        style={{
          backgroundImage: "url('/assets/generated/hero-bg-texture.dim_1920x600.png')",
        }}
      />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div className="max-w-3xl mx-auto text-center space-y-6 sm:space-y-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
            Discover Your Next Great Read
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Explore thousands of books across all genres
          </p>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <Input
              type="text"
              placeholder="Search by title, author, or genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 min-h-[44px] text-base"
            />
            <Button
              type="submit"
              size="lg"
              className="min-h-[44px] bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
            >
              <Search className="h-5 w-5 mr-2" />
              Search
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
