import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Brand {
  id: string;
  user_id: string;
  name: string;
  website_url: string | null;
  instagram_handle: string | null;
  twitter_handle: string | null;
  linkedin_handle: string | null;
  facebook_handle: string | null;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  voice_characteristics: string[];
  brand_essence: {
    mission: string;
    values: string[];
    usp: string;
  };
  target_audience: Array<{
    name: string;
    description: string;
  }>;
  content_themes: string[];
  created_at: string;
  updated_at: string;
}

export function useBrands() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: brands, isLoading, error } = useQuery({
    queryKey: ['brands', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Brand[];
    },
    enabled: !!user,
  });

  const createBrand = useMutation({
    mutationFn: async (brand: Partial<Brand>) => {
      if (!user) throw new Error('No user');

      const { data, error } = await supabase
        .from('brands')
        .insert({
          name: brand.name || '',
          website_url: brand.website_url,
          instagram_handle: brand.instagram_handle,
          twitter_handle: brand.twitter_handle,
          linkedin_handle: brand.linkedin_handle,
          facebook_handle: brand.facebook_handle,
          logo_url: brand.logo_url,
          primary_color: brand.primary_color,
          secondary_color: brand.secondary_color,
          voice_characteristics: brand.voice_characteristics,
          brand_essence: brand.brand_essence,
          target_audience: brand.target_audience,
          content_themes: brand.content_themes,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands', user?.id] });
    },
  });

  const updateBrand = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Brand> }) => {
      const { data, error } = await supabase
        .from('brands')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands', user?.id] });
    },
  });

  const deleteBrand = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('brands').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands', user?.id] });
    },
  });

  return {
    brands: brands ?? [],
    isLoading,
    error,
    createBrand: createBrand.mutate,
    updateBrand: updateBrand.mutate,
    deleteBrand: deleteBrand.mutate,
    isCreating: createBrand.isPending,
    isUpdating: updateBrand.isPending,
    isDeleting: deleteBrand.isPending,
  };
}
