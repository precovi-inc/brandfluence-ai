import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Instagram, Twitter, Linkedin, Facebook, Copy, Check, RefreshCw, Hash } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export interface PlatformVariation {
  platform: string;
  content: string;
  hashtags: string[];
  characterCount: number;
}

interface GeneratedContentCardProps {
  variation: PlatformVariation;
  onContentChange: (content: string) => void;
  onRegenerate: () => void;
  isRegenerating?: boolean;
}

const platformConfig: Record<string, { icon: typeof Instagram; color: string; maxLength: number }> = {
  instagram: { icon: Instagram, color: 'bg-instagram', maxLength: 2200 },
  twitter: { icon: Twitter, color: 'bg-twitter', maxLength: 280 },
  linkedin: { icon: Linkedin, color: 'bg-linkedin', maxLength: 3000 },
  facebook: { icon: Facebook, color: 'bg-facebook', maxLength: 500 },
};

export function GeneratedContentCard({ 
  variation, 
  onContentChange, 
  onRegenerate,
  isRegenerating = false 
}: GeneratedContentCardProps) {
  const [copied, setCopied] = useState(false);
  const config = platformConfig[variation.platform] || platformConfig.instagram;
  const Icon = config.icon;
  const isOverLimit = variation.characterCount > config.maxLength;

  const handleCopy = async () => {
    const fullContent = `${variation.content}\n\n${variation.hashtags.map(h => `#${h}`).join(' ')}`;
    await navigator.clipboard.writeText(fullContent);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className={cn('transition-all', isRegenerating && 'opacity-50')}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', config.color)}>
              <Icon className="h-4 w-4 text-white" />
            </div>
            <CardTitle className="text-base capitalize">{variation.platform}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              'text-xs',
              isOverLimit ? 'text-destructive' : 'text-muted-foreground'
            )}>
              {variation.characterCount}/{config.maxLength}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onRegenerate}
              disabled={isRegenerating}
            >
              <RefreshCw className={cn('h-4 w-4', isRegenerating && 'animate-spin')} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleCopy}
            >
              {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          value={variation.content}
          onChange={(e) => onContentChange(e.target.value)}
          className="min-h-[120px] resize-none"
          disabled={isRegenerating}
        />
        {variation.hashtags.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Hash className="h-3 w-3" />
              <span>Hashtags</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {variation.hashtags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
