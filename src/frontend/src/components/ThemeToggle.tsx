import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Persist theme to localStorage whenever it changes
  useEffect(() => {
    if (mounted && theme) {
      localStorage.setItem('theme-preference', theme);
    }
  }, [theme, mounted]);

  if (!mounted) {
    return null;
  }

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-50 bg-card/80 backdrop-blur-sm border-2 border-vangogh-gold/30 rounded-full h-12 w-12 hover:bg-vangogh-gold/20 hover:border-vangogh-gold/60 transition-all duration-300 shadow-lg"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 text-vangogh-yellow animate-pulse-slow" />
      ) : (
        <Moon className="h-5 w-5 text-vangogh-blue" />
      )}
    </Button>
  );
}
