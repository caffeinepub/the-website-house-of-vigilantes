import { useParams, useNavigate } from '@tanstack/react-router';
import { useMemo } from 'react';
import { useGetAllBooks } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { ArrowLeft, BookOpen, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import BookGrid from '../components/BookGrid';

export default function AuthorProfilePage() {
  const { authorName } = useParams({ from: '/author/$authorName' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: allBooks, isLoading } = useGetAllBooks();

  const isAuthenticated = !!identity;

  // Filter books by this author
  const authorBooks = useMemo(() => {
    if (!allBooks) return [];
    return allBooks.filter(
      book => book.author === authorName && book.approvalStatus.__kind__ === 'approved'
    );
  }, [allBooks, authorName]);

  // Check if current user is this author
  const isCurrentAuthor = useMemo(() => {
    if (!identity || !allBooks) return false;
    const userPrincipal = identity.getPrincipal().toString();
    return authorBooks.some(book => book.uploaderId.toString() === userPrincipal);
  }, [identity, authorBooks]);

  // Placeholder followers count
  const followersCount = 156;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-vangogh-blue/5">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-32 mb-6 rounded-full" />
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-64 w-full rounded-3xl" />
            <Skeleton className="h-96 w-full rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-vangogh-blue/5">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/authors' })}
          className="mb-6 hover:bg-vangogh-yellow/20"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Authors
        </Button>

        <div className="max-w-6xl mx-auto space-y-8">
          {/* Author Profile Header */}
          <Card className="rounded-3xl border-2 border-vangogh-yellow/30 bg-gradient-to-br from-vangogh-blue/5 to-vangogh-yellow/5">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Avatar Placeholder */}
                <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-vangogh-blue/30 to-vangogh-yellow/30 flex items-center justify-center">
                  <Users className="h-16 w-16 text-vangogh-blue" />
                </div>

                {/* Author Info */}
                <div className="flex-1 text-center md:text-left space-y-3">
                  <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
                    {authorName}
                  </h1>
                  <p className="text-muted-foreground leading-relaxed max-w-2xl">
                    Author bio placeholder - A talented writer contributing to our collection with unique perspectives and compelling stories.
                  </p>
                  
                  {/* Followers Counter */}
                  <div className="flex items-center justify-center md:justify-start gap-2 text-sm pt-2">
                    <Users className="h-4 w-4 text-vangogh-blue" />
                    <span className="font-bold text-vangogh-blue">{followersCount}</span>
                    <span className="text-muted-foreground">Followers</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 w-full md:w-auto">
                  {isCurrentAuthor && isAuthenticated && (
                    <Button
                      onClick={() => navigate({ to: '/author/dashboard' })}
                      className="bg-vangogh-blue hover:bg-vangogh-blue/90 text-white rounded-full w-full md:w-auto"
                    >
                      Manage Your Books
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="rounded-full border-2 border-vangogh-blue/30 hover:bg-vangogh-blue/10 w-full md:w-auto"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Follow
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Author's Books */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="h-8 w-8 text-vangogh-blue" />
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
                Published Books
              </h2>
              <span className="text-muted-foreground">({authorBooks.length})</span>
            </div>

            {authorBooks.length === 0 ? (
              <Card className="rounded-3xl border-2 border-vangogh-yellow/20 p-12 text-center">
                <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  This author hasn't published any books yet.
                </p>
              </Card>
            ) : (
              <BookGrid books={authorBooks} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
