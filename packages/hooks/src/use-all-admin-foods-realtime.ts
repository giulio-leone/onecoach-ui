'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { logger } from '@giulio-leone/lib-shared';

/**
 * Realtime hook for admin foods.
 * Invalidates the 'foods' query whenever any change occurs in the 'food_items' table.
 */
export function useAllAdminFoodsRealtime() {
  const supabase = createClientComponentClient();
  const queryClient = useQueryClient();

  useEffect(() => {
    logger.debug('Subscribing to food_items realtime changes');
    
    const channel = supabase
      .channel('admin-foods-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'food_items',
        },
        (payload: any) => {
          logger.debug('Food item changed realtime:', payload);
          // Invalidate all food lists
          void queryClient.invalidateQueries({ queryKey: ['foods'] });
        }
      )
      .subscribe();

    return () => {
      logger.debug('Unsubscribing from food_items realtime changes');
      void supabase.removeChannel(channel);
    };
  }, [supabase, queryClient]);
}
