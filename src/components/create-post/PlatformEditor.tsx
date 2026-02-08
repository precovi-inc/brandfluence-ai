import { useState, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { 
  Instagram, Twitter, Linkedin, Facebook, 
  Hash, Plus, X, Smile, AtSign, Link2,
  Bold, Italic, List, Type
} from 'lucide-react';
import { PlatformVariation } from '@/hooks/useContentGeneration';

interface PlatformEditorProps {
  variation: PlatformVariation;
  onChange: (content: string, hashtags?: string[]) => void;
  previewMode: boolean;
}

const platformConfig: Record<string, { 
  icon: typeof Instagram; 
  color: string; 
  maxLength: number;
  tips: string[];
}> = {
  instagram: { 
    icon: Instagram, 
    color: 'bg-instagram', 
    maxLength: 2200,
    tips: [
      'Use line breaks to improve readability',
      'Place hashtags at the end or in first comment',
      'Include a clear call-to-action',
      'Emojis boost engagement by 47%'
    ]
  },
  twitter: { 
    icon: Twitter, 
    color: 'bg-twitter', 
    maxLength: 280,
    tips: [
      'Keep it punchy and direct',
      'Use 1-2 hashtags max',
      'Ask questions to drive replies',
      'Threads work for longer content'
    ]
  },
  linkedin: { 
    icon: Linkedin, 
    color: 'bg-linkedin', 
    maxLength: 3000,
    tips: [
      'Hook readers in the first line',
      'Use professional but conversational tone',
      'Add 3-5 relevant hashtags',
      'Include industry insights or data'
    ]
  },
  facebook: { 
    icon: Facebook, 
    color: 'bg-facebook', 
    maxLength: 500,
    tips: [
      'Shorter posts get more engagement',
      'Ask questions to encourage comments',
      'Use emojis sparingly',
      'Include a clear value proposition'
    ]
  },
};

const quickEmojis = ['🚀', '✨', '💡', '🎉', '👋', '💪', '🔥', '❤️', '👀', '📣', '⭐', '🎯'];

export function PlatformEditor({ variation, onChange, previewMode }: PlatformEditorProps) {
  const [newHashtag, setNewHashtag] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const config = platformConfig[variation.platform] || platformConfig.instagram;
  const Icon = config.icon;
  const characterPercent = Math.min((variation.characterCount / config.maxLength) * 100, 100);
  const isOverLimit = variation.characterCount > config.maxLength;
  const isNearLimit = characterPercent > 80 && !isOverLimit;

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(variation.content + text, variation.hashtags);
      return;
    }
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = variation.content.substring(0, start) + text + variation.content.substring(end);
    onChange(newContent, variation.hashtags);
    
    // Reset cursor position after state update
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + text.length;
      textarea.focus();
    }, 0);
  };

  const addHashtag = () => {
    if (!newHashtag.trim()) return;
    const cleaned = newHashtag.replace(/^#/, '').trim();
    if (cleaned && !variation.hashtags.includes(cleaned)) {
      onChange(variation.content, [...variation.hashtags, cleaned]);
    }
    setNewHashtag('');
  };

  const removeHashtag = (tag: string) => {
    onChange(variation.content, variation.hashtags.filter(t => t !== tag));
  };

  const formatAsLineBreaks = () => {
    const formatted = variation.content.replace(/\. /g, '.\n\n');
    onChange(formatted, variation.hashtags);
  };

  if (previewMode) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', config.color)}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-medium capitalize">{variation.platform} Preview</h3>
            <p className="text-sm text-muted-foreground">How your post will appear</p>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <div className="whitespace-pre-wrap text-foreground">
            {variation.content}
          </div>
          {variation.hashtags.length > 0 && (
            <div className="mt-4 pt-4 border-t text-primary">
              {variation.hashtags.map(h => `#${h}`).join(' ')}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{variation.characterCount} characters</span>
          <span>{variation.hashtags.length} hashtags</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Platform Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', config.color)}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-medium capitalize">{variation.platform}</h3>
            <p className="text-sm text-muted-foreground">
              {config.maxLength - variation.characterCount} characters remaining
            </p>
          </div>
        </div>
      </div>

      {/* Character Limit Progress */}
      <div className="space-y-2">
        <Progress 
          value={characterPercent} 
          className={cn(
            'h-2',
            isOverLimit && '[&>div]:bg-destructive',
            isNearLimit && '[&>div]:bg-yellow-500'
          )}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span className={cn(isOverLimit && 'text-destructive font-medium')}>
            {variation.characterCount} / {config.maxLength}
          </span>
          {isOverLimit && (
            <span className="text-destructive">
              Over by {variation.characterCount - config.maxLength} characters
            </span>
          )}
        </div>
      </div>

      {/* Quick Actions Toolbar */}
      <div className="flex flex-wrap gap-2 p-2 rounded-lg bg-muted/50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="h-8 gap-1.5"
        >
          <Smile className="h-4 w-4" />
          <span className="hidden sm:inline">Emoji</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={formatAsLineBreaks}
          className="h-8 gap-1.5"
        >
          <List className="h-4 w-4" />
          <span className="hidden sm:inline">Add Breaks</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertAtCursor('\n\n👉 ')}
          className="h-8 gap-1.5"
        >
          <Type className="h-4 w-4" />
          <span className="hidden sm:inline">Add CTA</span>
        </Button>
      </div>

      {/* Emoji Quick Picker */}
      {showEmojiPicker && (
        <div className="flex flex-wrap gap-1 p-3 rounded-lg border bg-background animate-fade-up">
          {quickEmojis.map((emoji) => (
            <Button
              key={emoji}
              variant="ghost"
              size="sm"
              className="h-9 w-9 text-lg hover:bg-muted"
              onClick={() => {
                insertAtCursor(emoji);
                setShowEmojiPicker(false);
              }}
            >
              {emoji}
            </Button>
          ))}
        </div>
      )}

      {/* Main Content Editor */}
      <div className="space-y-2">
        <Label>Post Content</Label>
        <Textarea
          ref={textareaRef}
          value={variation.content}
          onChange={(e) => onChange(e.target.value, variation.hashtags)}
          className={cn(
            'min-h-[200px] resize-none text-base leading-relaxed',
            isOverLimit && 'border-destructive focus-visible:ring-destructive'
          )}
          placeholder="Write your post content..."
        />
      </div>

      {/* Hashtag Manager */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Hash className="h-4 w-4" />
          Hashtags ({variation.hashtags.length})
        </Label>
        
        <div className="flex gap-2">
          <Input
            value={newHashtag}
            onChange={(e) => setNewHashtag(e.target.value)}
            placeholder="Add a hashtag..."
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
          />
          <Button onClick={addHashtag} size="icon" variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {variation.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {variation.hashtags.map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="gap-1 pr-1 text-sm"
              >
                #{tag}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 hover:bg-transparent"
                  onClick={() => removeHashtag(tag)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Platform Tips */}
      <div className="rounded-lg border bg-muted/50 p-4">
        <h4 className="text-sm font-medium mb-2 capitalize">{variation.platform} Tips</h4>
        <ul className="space-y-1">
          {config.tips.map((tip, i) => (
            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
