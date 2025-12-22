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

    // Keep an anonymous visitor id stable across reloads so Preview/testing can reliably target guides.
    const anonKey = 'pendo_anon_visitor_id';
    const getAnonId = () => {
      const existing = localStorage.getItem(anonKey);
      if (existing) return existing;
      const created = `anonymous-${crypto.randomUUID()}`;
      localStorage.setItem(anonKey, created);
      return created;
    };

    const visitor = user
      ? {
          id: user.id,
          email: user.email,
          full_name: user.username,
          role: user.role,
        }
      : {
          id: getAnonId(),
        };

    const account = { id: 'asset-intelligence' };

    // Initialize only once; use identify on subsequent changes to avoid interrupting guide rendering.
    const w = window as unknown as { __pendoInitialized?: boolean; __pendoVisitorId?: string };

    if (!w.__pendoInitialized) {
      window.pendo.initialize({ visitor, account });
      w.__pendoInitialized = true;
      w.__pendoVisitorId = visitor.id;
      return;
    }

    if (w.__pendoVisitorId !== visitor.id) {
      window.pendo.identify({ visitor, account });
      w.__pendoVisitorId = visitor.id;
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
