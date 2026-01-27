import { useContentLibrary } from '@/hooks/useContentLibrary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const platformColors: Record<string, string> = {
  instagram: 'platform-instagram',
  twitter: 'platform-twitter',
  linkedin: 'platform-linkedin',
  facebook: 'platform-facebook',
};

export function UpcomingPosts() {
  const { content, isLoading } = useContentLibrary({ status: 'scheduled' });
  const upcomingPosts = content
    .filter((post) => post.scheduled_at)
    .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime())
    .slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Upcoming Posts</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/calendar" className="gap-1">
            View calendar <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : upcomingPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
              <CalendarDays className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm font-medium">No scheduled posts</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Schedule posts to see them here
            </p>
            <Button asChild className="mt-4" size="sm">
              <Link to="/create">Create & Schedule</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingPosts.map((post) => (
              <div
                key={post.id}
                className="flex items-center gap-3 rounded-lg p-2 transition-smooth hover:bg-muted/50"
              >
                <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <span className="text-xs font-medium">
                    {format(new Date(post.scheduled_at!), 'MMM')}
                  </span>
                  <span className="text-lg font-semibold leading-none">
                    {format(new Date(post.scheduled_at!), 'd')}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{post.title}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(post.scheduled_at!), 'h:mm a')}
                    </span>
                    {post.platforms.slice(0, 2).map((platform) => (
                      <Badge
                        key={platform}
                        variant="secondary"
                        className={cn('text-xs', platformColors[platform])}
                      >
                        {platform}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
