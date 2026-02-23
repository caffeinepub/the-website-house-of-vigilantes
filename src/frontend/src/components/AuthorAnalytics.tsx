import { useGetBook, useGetBookAverageRating, useBookmarkedBooks } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Eye, Heart, Star, BookOpen, TrendingUp } from 'lucide-react';
import { getMockAnalyticsData } from '../utils/mockAnalyticsData';

interface AuthorAnalyticsProps {
  selectedBookIsbn: string | null;
}

export default function AuthorAnalytics({ selectedBookIsbn }: AuthorAnalyticsProps) {
  const { data: book } = useGetBook(selectedBookIsbn || '');
  const { data: avgRating } = useGetBookAverageRating(selectedBookIsbn || '');
  const { data: bookmarkedBooks = [] } = useBookmarkedBooks();

  // Get mock analytics data
  const mockData = getMockAnalyticsData(selectedBookIsbn || '');

  if (!selectedBookIsbn || !book) {
    return (
      <Card className="border-2 border-vangogh-yellow/30 rounded-3xl">
        <CardContent className="py-12 text-center">
          <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground mb-2">
            No book selected
          </p>
          <p className="text-sm text-muted-foreground">
            Select a book from the Books tab to view its analytics
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate favorites count (mock - would come from backend)
  const favoritesCount = bookmarkedBooks.filter(b => b.isbn === book.isbn).length;

  return (
    <div className="space-y-6">
      {/* Selected Book Info */}
      <Card className="border-2 border-vangogh-yellow/30 rounded-3xl">
        <CardHeader>
          <CardTitle className="text-2xl font-serif text-vangogh-blue">
            Analytics for "{book.title}"
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <img
              src={book.coverImageUrl || '/assets/generated/placeholder-cover.dim_400x600.png'}
              alt={book.title}
              className="w-20 h-30 object-cover rounded-xl shadow-md"
              onError={(e) => {
                e.currentTarget.src = '/assets/generated/placeholder-cover.dim_400x600.png';
              }}
            />
            <div>
              <p className="text-sm text-muted-foreground">by {book.author}</p>
              <p className="text-sm text-muted-foreground">{book.genre}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={<Eye className="h-5 w-5" />}
          label="Book Views"
          value={mockData.views.toLocaleString()}
          trend="+12%"
        />
        <StatCard
          icon={<BookOpen className="h-5 w-5" />}
          label="Total Reads"
          value={mockData.reads.toLocaleString()}
          trend="+8%"
        />
        <StatCard
          icon={<Heart className="h-5 w-5" />}
          label="Favorites"
          value={mockData.favorites.toLocaleString()}
          trend="+15%"
        />
        <StatCard
          icon={<Star className="h-5 w-5" />}
          label="Average Rating"
          value={avgRating ? avgRating.toFixed(1) : '0.0'}
          trend=""
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Completion Rate"
          value={`${mockData.completionRate}%`}
          trend="+5%"
        />
        <StatCard
          icon={<BarChart3 className="h-5 w-5" />}
          label="Trending Position"
          value={`#${mockData.trendingPosition}`}
          trend=""
        />
      </div>

      {/* Engagement Trends Chart */}
      <Card className="border-2 border-vangogh-yellow/30 rounded-3xl">
        <CardHeader>
          <CardTitle className="text-xl font-serif text-vangogh-blue">
            Engagement Trends (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockData.trends.map((trend, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-24 text-sm text-muted-foreground">
                  {trend.date}
                </div>
                <div className="flex-1">
                  <div className="h-8 bg-gradient-to-r from-vangogh-blue to-vangogh-yellow rounded-full relative overflow-hidden">
                    <div
                      className="h-full bg-vangogh-blue/30 rounded-full transition-all"
                      style={{ width: `${(trend.value / Math.max(...mockData.trends.map(t => t.value))) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="w-16 text-right font-medium">
                  {trend.value}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4 italic">
            * Mock data for design purposes. Real analytics integration coming soon.
          </p>
        </CardContent>
      </Card>

      {/* Reading Progress Stats */}
      <Card className="border-2 border-vangogh-yellow/30 rounded-3xl">
        <CardHeader>
          <CardTitle className="text-xl font-serif text-vangogh-blue">
            Reading Progress Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockData.progressDistribution.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{item.label}</span>
                  <span className="font-medium">{item.percentage}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-vangogh-blue to-vangogh-gold rounded-full transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4 italic">
            * Mock data for design purposes. Real analytics integration coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
}) {
  return (
    <Card className="border-2 border-vangogh-yellow/30 rounded-2xl">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-2">
          <div className="p-2 bg-vangogh-blue/10 rounded-xl text-vangogh-blue">
            {icon}
          </div>
          {trend && (
            <span className="text-xs font-medium text-green-600">
              {trend}
            </span>
          )}
        </div>
        <div className="text-2xl font-bold text-vangogh-blue mb-1">
          {value}
        </div>
        <div className="text-sm text-muted-foreground">
          {label}
        </div>
      </CardContent>
    </Card>
  );
}
