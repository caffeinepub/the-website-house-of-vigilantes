import { Link } from '@tanstack/react-router';
import { BookOpen, Shield, Upload, Library } from 'lucide-react';
import LoginButton from './LoginButton';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../hooks/useQueries';

export default function Navigation() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const isAuthenticated = !!identity;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-starry-accent/30 bg-starry-background/95 backdrop-blur supports-[backdrop-filter]:bg-starry-background/80 transition-all duration-500">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-all duration-300 group">
            <BookOpen className="h-6 w-6 text-starry-secondary group-hover:rotate-12 transition-transform duration-300" />
            <span className="font-serif text-xl font-bold text-starry-secondary tracking-wide">
              THE HOUSE OF VIGILANTES
            </span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              to="/"
              className="text-sm font-medium text-starry-accent hover:text-starry-secondary transition-all duration-300 rounded-full px-3 py-1 hover:bg-starry-primary/20"
            >
              Collection
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/upload"
                  className="flex items-center gap-1.5 text-sm font-medium text-starry-accent hover:text-starry-secondary transition-all duration-300 rounded-full px-3 py-1 hover:bg-starry-primary/20"
                >
                  <Upload className="h-4 w-4" />
                  Upload Book
                </Link>
                <Link
                  to="/my-books"
                  className="flex items-center gap-1.5 text-sm font-medium text-starry-accent hover:text-starry-secondary transition-all duration-300 rounded-full px-3 py-1 hover:bg-starry-primary/20"
                >
                  <Library className="h-4 w-4" />
                  My Books
                </Link>
              </>
            )}
            {isAuthenticated && isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 text-sm font-medium text-starry-accent hover:text-starry-secondary transition-all duration-300 rounded-full px-3 py-1 hover:bg-starry-primary/20"
              >
                <Shield className="h-4 w-4" />
                Admin
              </Link>
            )}
            <LoginButton />
          </nav>
        </div>
      </div>
    </header>
  );
}
