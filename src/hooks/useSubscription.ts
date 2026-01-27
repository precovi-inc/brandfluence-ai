import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Subscription {
  id: string;
  user_id: string;
  plan_type: string;
  trial_start_date: string;
  trial_end_date: string;
  subscription_status: string;
}

export function useSubscription() {
  const { user } = useAuth();

  const { data: subscription, isLoading, error } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data as Subscription;
    },
    enabled: !!user,
  });

  const trialDaysRemaining = subscription
    ? Math.max(0, Math.ceil((new Date(subscription.trial_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const isTrialActive = subscription?.subscription_status === 'trial' && trialDaysRemaining > 0;
  const isSubscribed = subscription?.subscription_status === 'active';

  return {
    subscription,
    isLoading,
    error,
    trialDaysRemaining,
    isTrialActive,
    isSubscribed,
  };
}
