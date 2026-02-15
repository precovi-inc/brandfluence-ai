import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContentPost } from '@/hooks/useContentLibrary';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Instagram, Twitter, Linkedin, Facebook, Hash, FileText, Sparkles, Calendar, Clock, Edit } from 'lucide-react';
import { format } from 'date-fns';

interface PostPreviewDialogProps {
  post: ContentPost | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brandName?: string;
  onEdit?: (post: ContentPost) => void;
}

const platformIcons: Record<string, typeof Instagram> = {
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
  facebook: Facebook,
};

const platformColors: Record<string, string> = {
  instagram: 'bg-instagram',
  twitter: 'bg-twitter',
  linkedin: 'bg-linkedin',
  facebook: 'bg-facebook',
};

const statusStyles: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  scheduled: 'bg-accent text-accent-foreground',
  published: 'bg-primary/10 text-primary',
};

export function PostPreviewDialog({ post, open, onOpenChange, brandName, onEdit }: PostPreviewDialogProps) {
  if (!post) return null;

  const variations = (post.ai_variations || []) as Array<{ content: string; platform: string }>;
  const hasVariations = variations.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-lg leading-tight">{post.title}</DialogTitle>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge className={cn('text-xs', statusStyles[post.status])}>
                  {post.status}
                </Badge>
                {brandName && (
                  <Badge variant="outline" className="text-xs">
                    {brandName}
                  </Badge>
                )}
                {post.platforms.map((p) => {
                  const Icon = platformIcons[p];
                  return (
                    <Badge key={p} variant="secondary" className="text-xs gap-1">
                      {Icon && <Icon className="h-3 w-3" />}
                      {p}
                    </Badge>
                  );
                })}
              </div>
            </div>
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 shrink-0"
                onClick={() => {
                  onOpenChange(false);
                  onEdit(post);
                }}
              >
                <Edit className="h-3.5 w-3.5" />
                Edit
              </Button>
            )}
          </div>
        </DialogHeader>

        <Tabs defaultValue="content" className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <TabsList className="mx-6 mt-3 w-fit">
            <TabsTrigger value="content" className="gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              Content
            </TabsTrigger>
            {hasVariations && (
              <TabsTrigger value="variations" className="gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                AI Variations ({variations.length})
              </TabsTrigger>
            )}
          </TabsList>

          <div className="flex-1 min-h-0 overflow-y-auto">
            <TabsContent value="content" className="px-6 pb-6 mt-0 pt-4">
              <div className="space-y-4">
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{post.content}</p>
                </div>

                {post.hashtags && post.hashtags.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Hash className="h-3.5 w-3.5" />
                      Hashtags
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {post.hashtags.map((tag, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2 border-t">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Created {format(new Date(post.created_at), 'MMM d, yyyy')}
                  </span>
                  {post.scheduled_at && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      Scheduled {format(new Date(post.scheduled_at), 'MMM d, yyyy h:mm a')}
                    </span>
                  )}
                </div>
              </div>
            </TabsContent>

            {hasVariations && (
              <TabsContent value="variations" className="px-6 pb-6 mt-0 pt-4">
                <div className="space-y-4">
                  {variations.map((variation, index) => {
                    const Icon = platformIcons[variation.platform];
                    return (
                      <div key={index} className="rounded-lg border overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/40 border-b">
                          {Icon && (
                            <div className={cn('flex h-6 w-6 items-center justify-center rounded', platformColors[variation.platform])}>
                              <Icon className="h-3.5 w-3.5 text-white" />
                            </div>
                          )}
                          <span className="text-sm font-medium capitalize">{variation.platform}</span>
                        </div>
                        <div className="p-4">
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">{variation.content}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            )}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
