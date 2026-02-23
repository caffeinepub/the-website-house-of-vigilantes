import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetBooksByAuthor } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { BookOpen, Globe, Mail, User } from 'lucide-react';
import { SiFacebook, SiX, SiInstagram } from 'react-icons/si';
import BookGrid from '../components/BookGrid';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function AuthorProfilePage() {
  const { authorName } = useParams({ from: '/authenticated/author/$authorName' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: books = [], isLoading } = useGetBooksByAuthor(authorName);

  // Mock author data - in production, this would come from backend
  const authorBio = `${authorName} is a passionate writer dedicated to creating compelling stories that resonate with readers around the world.`;
  const authorWebsite = '';
  const authorSocial = {
    twitter: '',
    facebook: '',
    instagram: '',
  };

  const isAuthenticated = !!identity;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-vangogh-blue/5 to-vangogh-yellow/5">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Author Header Section */}
        <div className="bg-card rounded-3xl border-2 border-vangogh-yellow/30 p-8 mb-8 shadow-vangogh-glow">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Author Avatar */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-vangogh-blue to-vangogh-yellow flex items-center justify-center shadow-lg">
                <User className="h-16 w-16 text-white" />
              </div>
            </div>

            {/* Author Info */}
            <div className="flex-1">
              <h1 className="text-4xl font-serif font-bold text-vangogh-blue mb-2">
                {authorName}
              </h1>
              <p className="text-muted-foreground mb-4">Author</p>

              {/* Bio */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">About</h2>
                <p className="text-foreground/80 leading-relaxed">
                  {authorBio}
                </p>
              </div>

              {/* Social Links - Placeholder */}
              <div className="flex flex-wrap gap-3 mb-6">
                {authorWebsite && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => window.open(authorWebsite, '_blank')}
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Website
                  </Button>
                )}
                {authorSocial.twitter && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => window.open(authorSocial.twitter, '_blank')}
                  >
                    <SiX className="h-4 w-4 mr-2" />
                    Twitter
                  </Button>
                )}
                {authorSocial.facebook && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => window.open(authorSocial.facebook, '_blank')}
                  >
                    <SiFacebook className="h-4 w-4 mr-2" />
                    Facebook
                  </Button>
                )}
                {authorSocial.instagram && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => window.open(authorSocial.instagram, '_blank')}
                  >
                    <SiInstagram className="h-4 w-4 mr-2" />
                    Instagram
                  </Button>
                )}
              </div>

              {/* Login to Manage Button */}
              {isAuthenticated && (
                <Button
                  onClick={() => navigate({ to: '/author/dashboard' })}
                  className="bg-vangogh-blue hover:bg-vangogh-blue/90 text-white rounded-full"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Manage Your Books
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Published Books Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-serif font-bold text-vangogh-blue mb-6">
            Published Books
          </h2>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-vangogh-blue"></div>
              <p className="mt-4 text-muted-foreground">Loading books...</p>
            </div>
          ) : books.length > 0 ? (
            <BookGrid books={books} />
          ) : (
            <div className="text-center py-12 bg-card rounded-3xl border-2 border-vangogh-yellow/30">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-xl text-muted-foreground">
                No published books yet
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
