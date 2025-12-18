import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

declare global {
  interface Window {
    pendo: {
      initialize: (options: {
        visitor: { id: string; email?: string; role?: string };
        account: { id: string };
      }) => void;
      identify: (options: {
        visitor: { id: string; email?: string; role?: string };
        account: { id: string };
      }) => void;
    };
  }
}

export function usePendo() {
  const { user } = useAuth();

  useEffect(() => {
    if (typeof window.pendo === 'undefined') return;

    if (user) {
      // Identify authenticated user
      window.pendo.initialize({
        visitor: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        account: {
          id: 'asset-intelligence',
        },
      });
    } else {
      // Anonymous visitor
      window.pendo.initialize({
        visitor: {
          id: `anonymous-${crypto.randomUUID()}`,
        },
        account: {
          id: 'asset-intelligence',
        },
      });
    }
  }, [user]);
}
