import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, User, Star, BookOpen, Trophy } from 'lucide-react';
import { getMockReaderData } from '../utils/mockReaderData';

export default function AuthorReaderInteraction() {
  const { comments, topFans } = getMockReaderData();

  return (
    <div className="space-y-6">
      {/* Comments Section */}
      <Card className="border-2 border-vangogh-yellow/30 rounded-3xl">
        <CardHeader>
          <CardTitle className="text-2xl font-serif text-vangogh-blue flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            Reader Comments & Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          {comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No comments yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-4 bg-muted/50 rounded-2xl border border-border"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-vangogh-blue to-vangogh-yellow flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{comment.readerName}</span>
                        <span className="text-xs text-muted-foreground">
                          {comment.timestamp}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        on "{comment.bookTitle}"
                      </p>
                      <p className="text-foreground">{comment.text}</p>
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full text-xs"
                        >
                          Reply
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="rounded-full text-xs"
                        >
                          Mark as Read
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-4 italic">
            * Mock data for design purposes. Real comment system integration coming soon.
          </p>
        </CardContent>
      </Card>

      {/* Top Fans Section */}
      <Card className="border-2 border-vangogh-yellow/30 rounded-3xl">
        <CardHeader>
          <CardTitle className="text-2xl font-serif text-vangogh-blue flex items-center gap-2">
            <Trophy className="h-6 w-6" />
            Top Fans
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topFans.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No fan data yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topFans.map((fan, index) => (
                <div
                  key={fan.id}
                  className="flex items-center gap-4 p-4 bg-muted/50 rounded-2xl border border-border"
                >
                  {/* Rank Badge */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                    index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                    index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                    index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                    'bg-gradient-to-br from-vangogh-blue to-vangogh-yellow'
                  }`}>
                    {index + 1}
                  </div>

                  {/* Fan Info */}
                  <div className="flex-1">
                    <div className="font-semibold">{fan.readerName}</div>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {fan.totalReads} reads
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {fan.totalRatings} ratings
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {fan.totalComments} comments
                      </span>
                    </div>
                  </div>

                  {/* Engagement Score */}
                  <div className="text-right">
                    <div className="text-2xl font-bold text-vangogh-blue">
                      {fan.engagementScore}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      engagement
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-4 italic">
            * Mock data for design purposes. Real fan tracking integration coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
