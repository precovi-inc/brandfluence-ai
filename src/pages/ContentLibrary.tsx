import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useContentLibrary } from '@/hooks/useContentLibrary';
import { useBrands } from '@/hooks/useBrands';
import { useState } from 'react';
import { Search, Plus, FileText, MoreVertical, Trash2, Edit, Copy, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const platformColors: Record<string, string> = {
  instagram: 'platform-instagram',
  twitter: 'platform-twitter',
  linkedin: 'platform-linkedin',
  facebook: 'platform-facebook',
};

const statusColors: Record<string, string> = {
  draft: 'status-draft',
  scheduled: 'status-scheduled',
  published: 'status-published',
};

export default function ContentLibrary() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [brandFilter, setBrandFilter] = useState<string>('all');

  const { brands } = useBrands();

  const { content, isLoading, deletePost } = useContentLibrary({
    search: search || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    platform: platformFilter !== 'all' ? platformFilter : undefined,
    brandId: brandFilter !== 'all' ? brandFilter : undefined,
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Content Library</h1>
            <p className="mt-1 text-muted-foreground">
              Browse and manage all your generated content
            </p>
          </div>
          <Button asChild className="gap-2">
            <Link to="/create">
              <Plus className="h-4 w-4" />
              Create Post
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="twitter">Twitter</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
            </SelectContent>
          </Select>
          <Select value={brandFilter} onValueChange={setBrandFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Brand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.id}>
                  <div className="flex items-center gap-2">
                    <Palette className="h-3.5 w-3.5 text-muted-foreground" />
                    {brand.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Content Grid */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="mt-3 h-16 rounded bg-muted" />
                  <div className="mt-4 flex gap-2">
                    <div className="h-5 w-16 rounded bg-muted" />
                    <div className="h-5 w-16 rounded bg-muted" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : content.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-medium">No content found</h3>
              <p className="mt-1 text-center text-sm text-muted-foreground">
                {search || statusFilter !== 'all' || platformFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first post to get started'}
              </p>
              <Button asChild className="mt-4 gap-2">
                <Link to="/create">
                  <Plus className="h-4 w-4" />
                  Create Post
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {content.map((post) => (
              <Card key={post.id} className="transition-smooth hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-medium">{post.title}</h3>
                      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                        {post.content}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => deletePost(post.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className={cn('text-xs', statusColors[post.status])}>
                      {post.status}
                    </Badge>
                    {post.brand_id && (() => {
                      const brand = brands.find(b => b.id === post.brand_id);
                      return brand ? (
                        <Badge variant="outline" className="text-xs gap-1">
                          <Palette className="h-3 w-3" />
                          {brand.name}
                        </Badge>
                      ) : null;
                    })()}
                    {post.platforms.map((platform) => (
                      <Badge
                        key={platform}
                        variant="secondary"
                        className={cn('text-xs', platformColors[platform])}
                      >
                        {platform}
                      </Badge>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Created {format(new Date(post.created_at), 'MMM d, yyyy')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
