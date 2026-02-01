import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PlatformVariation {
  platform: string;
  content: string;
  hashtags: string[];
  characterCount: number;
}

interface GenerateContentParams {
  title: string;
  direction: string;
  platforms: string[];
  imageUrls: string[];
  brandId?: string;
}

export function useContentGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [variations, setVariations] = useState<PlatformVariation[]>([]);
  const [error, setError] = useState<string | null>(null);

  const generateContent = async (params: GenerateContentParams) => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await supabase.functions.invoke('generate-post-content', {
        body: params,
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to generate content');
      }

      const { variations: generatedVariations, error: apiError } = response.data;

      if (apiError) {
        throw new Error(apiError);
      }

      setVariations(generatedVariations);
      toast.success('Content generated successfully!');
      return generatedVariations;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate content';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const updateVariation = (platform: string, content: string) => {
    setVariations(prev => 
      prev.map(v => 
        v.platform === platform 
          ? { ...v, content, characterCount: content.length }
          : v
      )
    );
  };

  const regenerateSingle = async (platform: string, params: GenerateContentParams) => {
    const singleParams = { ...params, platforms: [platform] };
    
    try {
      const response = await supabase.functions.invoke('generate-post-content', {
        body: singleParams,
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to regenerate');
      }

      const { variations: newVariations } = response.data;
      if (newVariations?.[0]) {
        setVariations(prev =>
          prev.map(v => v.platform === platform ? newVariations[0] : v)
        );
        toast.success(`${platform} content regenerated`);
      }
    } catch (err) {
      toast.error('Failed to regenerate content');
    }
  };

  const clearVariations = () => {
    setVariations([]);
    setError(null);
  };

  return {
    isGenerating,
    variations,
    error,
    generateContent,
    updateVariation,
    regenerateSingle,
    clearVariations,
  };
}
