import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function LandingPage() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  // Redirect authenticated users to /home
  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/home' });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  // Get background image based on theme
  const backgroundImage = theme === 'dark' 
    ? '/assets/generated/landing-dark.dim_1920x1080.png'
    : '/assets/generated/landing-light.dim_1920x1080.png';

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Full-screen Van Gogh background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700"
        style={{ 
          backgroundImage: `url(${backgroundImage})`,
        }}
      />
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />

      {/* Theme Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 bg-card/80 backdrop-blur-sm border-2 border-vangogh-gold/40 rounded-full h-14 w-14 hover:bg-vangogh-gold/20 hover:border-vangogh-gold/70 transition-all duration-300 shadow-xl"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <Sun className="h-6 w-6 text-vangogh-yellow animate-pulse-slow" />
        ) : (
          <Moon className="h-6 w-6 text-vangogh-blue" />
        )}
      </Button>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <div className="text-center max-w-4xl mx-auto space-y-8 animate-fade-in">
          {/* Logo/Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-vangogh-yellow to-vangogh-gold flex items-center justify-center shadow-2xl animate-float">
              <img 
                src="/assets/generated/owl-logo.dim_64x64.png" 
                alt="Logo" 
                className="w-16 h-16"
              />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif font-bold text-white text-shadow-xl mb-6 leading-tight">
            THE HOUSE OF
            <br />
            <span className="text-vangogh-yellow">VIGILANTES</span>
          </h1>

          {/* Tagline */}
          <p className="text-xl sm:text-2xl md:text-3xl text-white/95 text-shadow-lg font-light mb-8 leading-relaxed">
            Discover stories that inspire, entertain, and transform
          </p>

          {/* Description */}
          <p className="text-base sm:text-lg text-white/90 text-shadow-md max-w-2xl mx-auto mb-12 leading-relaxed">
            Join our community of readers and authors. Explore curated collections,
            personalized recommendations, and immersive reading experiences.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-delay">
            <Button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="bg-vangogh-blue hover:bg-vangogh-blue/90 text-white rounded-full px-10 py-7 text-lg font-semibold shadow-2xl hover:shadow-vangogh-glow transition-all duration-300 transform hover:scale-105 min-w-[200px]"
            >
              {isLoggingIn ? (
                <>
                  <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                  Logging in...
                </>
              ) : (
                'Log In'
              )}
            </Button>
            
            <Button
              onClick={handleLogin}
              disabled={isLoggingIn}
              variant="outline"
              className="bg-vangogh-yellow/90 hover:bg-vangogh-yellow text-vangogh-blue border-2 border-vangogh-gold rounded-full px-10 py-7 text-lg font-semibold shadow-2xl hover:shadow-vangogh-glow transition-all duration-300 transform hover:scale-105 min-w-[200px]"
            >
              {isLoggingIn ? 'Please wait...' : 'Sign Up'}
            </Button>
          </div>

          {/* Additional Info */}
          <p className="text-sm text-white/70 text-shadow-sm mt-8">
            Powered by Internet Identity for secure, privacy-first authentication
          </p>
        </div>
      </div>
    </div>
  );
}
