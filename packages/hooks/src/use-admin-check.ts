/**
 * useAdminCheck Hook
 *
 * Hook per verificare se l'utente corrente è admin
 */

import { useState, useEffect } from 'react';

export function useAdminCheck(): boolean {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const data = await response.json();
          const user = data?.profile?.user || {};
          setIsAdmin(user.role === 'ADMIN');
        }
      } catch (err: unknown) {
        console.error('Failed to check admin status:', err);
      }
    };

    void checkAdmin();
  }, []);

  return isAdmin;
}
