import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Shield, Upload, Library, Menu, BookOpen, Heart } from 'lucide-react';
import LoginButton from './LoginButton';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function Navigation() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const isAuthenticated = !!identity;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NavLinks = () => (
    <>
      <Link
        to="/"
        className="text-sm font-medium text-starry-accent hover:text-starry-secondary transition-all duration-300 rounded-full px-3 py-1 hover:bg-starry-primary/20"
        onClick={() => setMobileMenuOpen(false)}
      >
        Collection
      </Link>
      <Link
        to="/browse"
        className="flex items-center gap-1.5 text-sm font-medium text-starry-accent hover:text-starry-secondary transition-all duration-300 rounded-full px-3 py-1 hover:bg-starry-primary/20"
        onClick={() => setMobileMenuOpen(false)}
      >
        <BookOpen className="h-4 w-4" />
        Browse Books
      </Link>
      {isAuthenticated && (
        <>
          <Link
            to="/upload"
            className="flex items-center gap-1.5 text-sm font-medium text-starry-accent hover:text-starry-secondary transition-all duration-300 rounded-full px-3 py-1 hover:bg-starry-primary/20"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Upload className="h-4 w-4" />
            Upload Book
          </Link>
          <Link
            to="/my-books"
            className="flex items-center gap-1.5 text-sm font-medium text-starry-accent hover:text-starry-secondary transition-all duration-300 rounded-full px-3 py-1 hover:bg-starry-primary/20"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Library className="h-4 w-4" />
            My Books
          </Link>
          <Link
            to="/favorites"
            className="flex items-center gap-1.5 text-sm font-medium text-starry-accent hover:text-starry-secondary transition-all duration-300 rounded-full px-3 py-1 hover:bg-starry-primary/20"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Heart className="h-4 w-4" />
            Favorites
          </Link>
        </>
      )}
      {isAuthenticated && isAdmin && (
        <Link
          to="/admin"
          className="flex items-center gap-1.5 text-sm font-medium text-starry-accent hover:text-starry-secondary transition-all duration-300 rounded-full px-3 py-1 hover:bg-starry-primary/20"
          onClick={() => setMobileMenuOpen(false)}
        >
          <Shield className="h-4 w-4" />
          Admin
        </Link>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-starry-accent/30 bg-starry-background/95 backdrop-blur supports-[backdrop-filter]:bg-starry-background/80 transition-all duration-500">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-all duration-300 group">
            <img 
              src="/assets/generated/owl-logo.dim_64x64.png" 
              alt="House of Vigilantes Owl Logo"
              className="h-8 w-8 group-hover:scale-110 transition-transform duration-300"
            />
            <span className="font-serif text-lg md:text-xl font-bold text-starry-secondary tracking-wide">
              THE HOUSE OF VIGILANTES
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLinks />
            <LoginButton />
          </nav>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-2">
            <LoginButton />
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <nav className="flex flex-col gap-4 mt-8">
                  <NavLinks />
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
