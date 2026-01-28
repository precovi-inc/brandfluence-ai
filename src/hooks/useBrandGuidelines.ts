import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface BrandGuideline {
  id: string;
  brand_id: string;
  file_name: string;
  file_type: string;
  file_url: string;
  parsed_content: string | null;
  created_at: string;
  updated_at: string;
}

export function useBrandGuidelines(brandId: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: guidelines, isLoading, error } = useQuery({
    queryKey: ['brand-guidelines', brandId],
    queryFn: async () => {
      if (!user || !brandId) return [];

      const { data, error } = await supabase
        .from('brand_guidelines')
        .select('*')
        .eq('brand_id', brandId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BrandGuideline[];
    },
    enabled: !!user && !!brandId,
  });

  const uploadGuideline = useMutation({
    mutationFn: async ({ file, brandId }: { file: File; brandId: string }) => {
      if (!user) throw new Error('No user');

      // Upload file to storage
      const fileExt = file.name.split('.').pop() || 'file';
      const filePath = `${user.id}/${brandId}/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from('brand-guidelines')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('brand-guidelines')
        .getPublicUrl(filePath);

      // Since bucket is private, create a signed URL
      const { data: signedData, error: signedError } = await supabase.storage
        .from('brand-guidelines')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (signedError) throw signedError;

      const fileUrl = signedData.signedUrl;

      // Call edge function to parse with AI
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-brand-guidelines`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fileUrl,
            fileName: file.name,
            fileType: fileExt,
            brandId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to parse guidelines');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-guidelines', brandId] });
    },
  });

  const deleteGuideline = useMutation({
    mutationFn: async (guidelineId: string) => {
      const { error } = await supabase
        .from('brand_guidelines')
        .delete()
        .eq('id', guidelineId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-guidelines', brandId] });
    },
  });

  return {
    guidelines: guidelines ?? [],
    isLoading,
    error,
    uploadGuideline: uploadGuideline.mutate,
    deleteGuideline: deleteGuideline.mutate,
    isUploading: uploadGuideline.isPending,
    isDeleting: deleteGuideline.isPending,
  };
}
