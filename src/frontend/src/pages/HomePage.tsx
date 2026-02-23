import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useTheme } from 'next-themes';
import ThemeToggle from '../components/ThemeToggle';
import LoginButton from '../components/LoginButton';
import Footer from '../components/Footer';

export default function HomePage() {
  const navigate = useNavigate();
  const { identity, isInitializing } = useInternetIdentity();
  const { theme } = useTheme();
  const isAuthenticated = !!identity;

  // Redirect authenticated users to personalized home
  useEffect(() => {
    if (!isInitializing && isAuthenticated) {
      navigate({ to: '/home' });
    }
  }, [isAuthenticated, isInitializing, navigate]);

  // Show loading state while checking authentication
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-vangogh-blue/10 to-vangogh-yellow/10">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vangogh-blue mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render landing page if authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  // Dynamic background image based on theme
  const backgroundImage = theme === 'dark' 
    ? '/assets/generated/landing-dark.dim_1920x1080.png'
    : '/assets/generated/landing-light.dim_1920x1080.png';

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Full-screen Van Gogh Background with dynamic theme switching */}
      <div
        className="absolute inset-0 z-0 transition-opacity duration-500"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
      </div>

      {/* Theme Toggle */}
      <ThemeToggle />

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Website Name */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white drop-shadow-2xl animate-fade-in">
              Book Haven
            </h1>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-vangogh-yellow drop-shadow-2xl animate-fade-in-delay">
              A Van Gogh-Inspired Journey
            </h2>
          </div>

          {/* Tagline */}
          <p className="text-xl md:text-2xl lg:text-3xl text-white/90 font-serif drop-shadow-lg max-w-2xl mx-auto">
            Discover, Share, and Explore the World of Books
          </p>

          {/* Description */}
          <p className="text-base md:text-lg text-white/80 max-w-xl mx-auto leading-relaxed">
            A modern platform inspired by art and literature. Join our community to explore curated collections, 
            discover mood-based recommendations, and connect with fellow book lovers.
          </p>

          {/* Login Section */}
          <div className="pt-8 border-t border-white/20 mt-12">
            <p className="text-sm text-white/70 mb-4">
              Authenticate with Internet Identity to get started:
            </p>
            <div className="flex justify-center">
              <LoginButton />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
