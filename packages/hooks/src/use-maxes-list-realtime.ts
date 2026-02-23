'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
// We need access to the supabase client. Usually provided by a context or hook.
// Assuming useSupabase or createClientComponentClient
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { logger } from '@giulio-leone/lib-shared';

export function useMaxesListRealtime() {
  const supabase = createClientComponentClient();
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('one-rep-maxes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_one_rep_maxes',
        },
        (payload: unknown) => {
          logger.debug('One Rep Max changed realtime:', payload);
          void queryClient.invalidateQueries({ queryKey: ['one-rep-maxes'] });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase, queryClient]);
}
