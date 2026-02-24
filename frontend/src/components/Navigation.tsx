import React, { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Menu, X, Home, BookOpen, Upload, User, TrendingUp, Users } from 'lucide-react';
import LoginButton from './LoginButton';
import ThemeToggle from './ThemeToggle';
import RoleBadge from './RoleBadge';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from './ui/button';

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const isAuthenticated = !!identity;

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleNavigation = (path: string) => {
    navigate({ to: path });
    closeMobileMenu();
  };

  const navItems = [
    { path: '/home', label: 'Home', icon: Home },
    { path: '/browse', label: 'Browse', icon: BookOpen },
    { path: '/trending', label: 'Trending', icon: TrendingUp },
    { path: '/authors', label: 'Authors', icon: Users },
    { path: '/upload', label: 'Upload', icon: Upload },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            to="/home"
            className="flex items-center space-x-2 text-xl font-bold text-primary hover:text-primary/80 transition-colors"
          >
            <BookOpen className="h-6 w-6" />
            <span className="hidden sm:inline">THE HOUSE OF VIGILANTES</span>
            <span className="sm:hidden">THOV</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-2">
            <RoleBadge />
            <ThemeToggle />
            <LoginButton />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="min-w-[44px] min-h-[44px]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-40 bg-background md:hidden">
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className="flex items-center w-full min-h-[44px] px-4 py-3 rounded-lg text-left text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Mobile Menu Footer */}
            <div className="border-t border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <RoleBadge />
              </div>
              <LoginButton />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
