import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    pendo: {
      initialize: (options: {
        visitor: { id: string; email?: string; full_name?: string; role?: string };
        account: { id: string };
      }) => void;
      identify: (options: {
        visitor: { id: string; email?: string; full_name?: string; role?: string };
        account: { id: string };
      }) => void;
      track: (eventName: string, metadata?: Record<string, unknown>) => void;
    };
  }
}

export function trackPendoEvent(eventName: string, metadata?: Record<string, unknown>) {
  if (typeof window.pendo !== 'undefined' && window.pendo.track) {
    window.pendo.track(eventName, metadata);
  }
}

export function usePendo() {
  const { user } = useAuth();

  useEffect(() => {
    if (typeof window.pendo === 'undefined') return;

    if (user) {
      window.pendo.initialize({
        visitor: {
          id: user.id,
          email: user.email,
          full_name: user.username,
          role: user.role,
        },
        account: {
          id: 'asset-intelligence',
        },
      });
    } else {
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

export function usePendoPageTracking() {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    trackPendoEvent('page_view', {
      path: location.pathname,
      userId: user?.id || 'anonymous',
      timestamp: new Date().toISOString(),
    });
  }, [location.pathname, user?.id]);
}
