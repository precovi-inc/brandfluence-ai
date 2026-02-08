import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlatformEditor } from './PlatformEditor';
import { PlatformVariation } from '@/hooks/useContentGeneration';
import { ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface CraftStepProps {
  variations: PlatformVariation[];
  onVariationChange: (platform: string, content: string, hashtags?: string[]) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function CraftStep({ variations, onVariationChange, onBack, onContinue }: CraftStepProps) {
  const [previewMode, setPreviewMode] = useState(false);
  const [activePlatform, setActivePlatform] = useState(variations[0]?.platform || '');

  const activeVariation = variations.find(v => v.platform === activePlatform);

  return (
    <div className="space-y-6 animate-fade-up">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Craft Your Content</CardTitle>
              <CardDescription>
                Fine-tune your generated content with formatting and hashtag options
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
              className="gap-2"
            >
              {previewMode ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Edit Mode
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Preview
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Platform Tabs */}
          <div className="flex gap-2 border-b pb-4 mb-6 overflow-x-auto">
            {variations.map((variation) => (
              <Button
                key={variation.platform}
                variant={activePlatform === variation.platform ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActivePlatform(variation.platform)}
                className="capitalize whitespace-nowrap"
              >
                {variation.platform}
              </Button>
            ))}
          </div>

          {/* Active Platform Editor */}
          {activeVariation && (
            <PlatformEditor
              variation={activeVariation}
              onChange={(content, hashtags) => onVariationChange(activeVariation.platform, content, hashtags)}
              previewMode={previewMode}
            />
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Generate
        </Button>
        <Button onClick={onContinue} className="gap-2">
          Continue to Finalize
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
