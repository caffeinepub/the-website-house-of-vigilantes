import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import LoginButton from '../components/LoginButton';
import ThemeToggle from '../components/ThemeToggle';

export default function HomePage() {
  const navigate = useNavigate();
  const { identity, isInitializing } = useInternetIdentity();

  React.useEffect(() => {
    if (!isInitializing && identity) {
      navigate({ to: '/home' });
    }
  }, [identity, isInitializing, navigate]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image - Theme Responsive */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: "url('/assets/generated/landing-light.dim_1920x1080.png')",
        }}
      />
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed dark:opacity-100 opacity-0 transition-opacity duration-300"
        style={{
          backgroundImage: "url('/assets/generated/landing-dark.dim_1920x1080.png')",
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60" />

      {/* Theme Toggle - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl text-center space-y-6 sm:space-y-8">
          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-2xl leading-tight">
            THE HOUSE OF VIGILANTES
          </h1>

          {/* Tagline */}
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 drop-shadow-lg max-w-2xl mx-auto px-4">
            A sanctuary for knowledge seekers and storytellers
          </p>

          {/* Description */}
          <p className="text-sm sm:text-base md:text-lg text-white/80 max-w-xl mx-auto px-4">
            Discover profound literature, share your wisdom, and connect with minds that inspire intellectual growth
          </p>

          {/* Login Button */}
          <div className="pt-4 sm:pt-6 flex justify-center">
            <div className="w-full sm:w-auto sm:min-w-[200px]">
              <LoginButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
