import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { useContentLibrary } from '@/hooks/useContentLibrary';
import { useState } from 'react';
import { format, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

const platformColors: Record<string, string> = {
  instagram: 'bg-instagram',
  twitter: 'bg-twitter',
  linkedin: 'bg-linkedin',
  facebook: 'bg-facebook',
};

export default function ContentCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { content } = useContentLibrary({ status: 'scheduled' });

  const scheduledPosts = content.filter((post) => post.scheduled_at);
  const postsForSelectedDate = scheduledPosts.filter(
    (post) => post.scheduled_at && isSameDay(new Date(post.scheduled_at), selectedDate)
  );

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Content Calendar</h1>
            <p className="mt-1 text-muted-foreground">
              Schedule and manage your upcoming posts
            </p>
          </div>
          <Button asChild className="gap-2">
            <Link to="/create">
              <Plus className="h-4 w-4" />
              Schedule Post
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Calendar */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{format(selectedDate, 'MMMM yyyy')}</CardTitle>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() =>
                    setSelectedDate(
                      new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1)
                    )
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(new Date())}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() =>
                    setSelectedDate(
                      new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1)
                    )
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                month={selectedDate}
                onMonthChange={setSelectedDate}
                className="rounded-md border-0 p-0"
                modifiers={{
                  hasPost: scheduledPosts
                    .filter((p) => p.scheduled_at)
                    .map((p) => new Date(p.scheduled_at!)),
                }}
                modifiersClassNames={{
                  hasPost: 'relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-1 after:rounded-full after:bg-primary',
                }}
              />
            </CardContent>
          </Card>

          {/* Posts for Selected Date */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {format(selectedDate, 'EEEE, MMM d')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {postsForSelectedDate.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                    <CalendarDays className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="mt-3 text-sm font-medium">No posts scheduled</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Create content for this day
                  </p>
                  <Button asChild size="sm" className="mt-4">
                    <Link to="/create">Create Post</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {postsForSelectedDate.map((post) => (
                    <div
                      key={post.id}
                      className="rounded-lg border border-border p-3 transition-smooth hover:bg-muted/50"
                    >
                      <p className="text-sm font-medium">{post.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {post.scheduled_at && format(new Date(post.scheduled_at), 'h:mm a')}
                      </p>
                      <div className="mt-2 flex gap-1">
                        {post.platforms.map((platform) => (
                          <div
                            key={platform}
                            className={cn(
                              'h-2 w-2 rounded-full',
                              platformColors[platform]
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
