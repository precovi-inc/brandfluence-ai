import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ContentPost {
  id: string;
  user_id: string;
  brand_id: string | null;
  title: string;
  content: string;
  media_urls: string[];
  platforms: string[];
  status: 'draft' | 'scheduled' | 'published';
  hashtags: string[];
  scheduled_at: string | null;
  published_at: string | null;
  ai_variations: Array<{ content: string; platform: string }>;
  created_at: string;
  updated_at: string;
}

interface ContentFilters {
  status?: string;
  platform?: string;
  brandId?: string;
  search?: string;
}

export function useContentLibrary(filters?: ContentFilters) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: content, isLoading, error } = useQuery({
    queryKey: ['content-library', user?.id, filters],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('content_library')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.brandId) {
        query = query.eq('brand_id', filters.brandId);
      }
      if (filters?.platform) {
        query = query.contains('platforms', [filters.platform]);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ContentPost[];
    },
    enabled: !!user,
  });

  const createPost = useMutation({
    mutationFn: async (post: Partial<ContentPost>) => {
      if (!user) throw new Error('No user');

      const { data, error } = await supabase
        .from('content_library')
        .insert({
          title: post.title || '',
          content: post.content || '',
          brand_id: post.brand_id,
          media_urls: post.media_urls,
          platforms: post.platforms,
          status: post.status,
          hashtags: post.hashtags,
          scheduled_at: post.scheduled_at,
          ai_variations: post.ai_variations,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-library'] });
    },
  });

  const updatePost = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ContentPost> }) => {
      const { data, error } = await supabase
        .from('content_library')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-library'] });
    },
  });

  const deletePost = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('content_library').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-library'] });
    },
  });

  return {
    content: content ?? [],
    isLoading,
    error,
    createPost: createPost.mutate,
    updatePost: updatePost.mutate,
    deletePost: deletePost.mutate,
    isCreating: createPost.isPending,
    isUpdating: updatePost.isPending,
    isDeleting: deletePost.isPending,
  };
}
