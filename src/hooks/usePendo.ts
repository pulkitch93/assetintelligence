import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';

// Pendo AI Agent ID for Conversations API
const PENDO_AGENT_ID = 'V8WejePxMU5ErgzTflX0LY6hnrU';

interface PendoAgentEventData {
  agentId: string;
  conversationId: string;
  messageId: string;
  content: string;
  modelUsed: string;
  suggestedPrompt: boolean;
  toolsUsed: string[];
  fileUploaded: boolean;
}

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
      trackAgent: (eventType: 'prompt' | 'agent_response' | 'user_reaction', data: PendoAgentEventData) => void;
    };
  }
}

export function trackPendoEvent(eventName: string, metadata?: Record<string, unknown>) {
  if (typeof window.pendo !== 'undefined' && window.pendo.track) {
    window.pendo.track(eventName, metadata);
  }
}

/**
 * Track AI Copilot conversation events using Pendo Conversations API
 */
export function trackPendoAgentEvent(
  eventType: 'prompt' | 'agent_response' | 'user_reaction',
  data: Omit<PendoAgentEventData, 'agentId'>
) {
  if (typeof window.pendo !== 'undefined' && window.pendo.trackAgent) {
    window.pendo.trackAgent(eventType, {
      agentId: PENDO_AGENT_ID,
      ...data,
    });
    console.log(`[Pendo] trackAgent: ${eventType}`, { agentId: PENDO_AGENT_ID, ...data });
  }
}

/**
 * Hook to manage Pendo conversation tracking for AI Copilot
 */
export function usePendoConversation() {
  const conversationIdRef = useRef<string>(`conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  const trackPrompt = useCallback((messageId: string, content: string, options?: {
    modelUsed?: string;
    suggestedPrompt?: boolean;
    toolsUsed?: string[];
    fileUploaded?: boolean;
  }) => {
    trackPendoAgentEvent('prompt', {
      conversationId: conversationIdRef.current,
      messageId,
      content,
      modelUsed: options?.modelUsed || 'gpt-4',
      suggestedPrompt: options?.suggestedPrompt || false,
      toolsUsed: options?.toolsUsed || [],
      fileUploaded: options?.fileUploaded || false,
    });
  }, []);

  const trackAgentResponse = useCallback((messageId: string, content: string, options?: {
    modelUsed?: string;
    toolsUsed?: string[];
  }) => {
    trackPendoAgentEvent('agent_response', {
      conversationId: conversationIdRef.current,
      messageId,
      content,
      modelUsed: options?.modelUsed || 'gpt-4',
      suggestedPrompt: false,
      toolsUsed: options?.toolsUsed || [],
      fileUploaded: false,
    });
  }, []);

  const trackUserReaction = useCallback((messageId: string, reaction: 'positive' | 'negative' | 'mixed', options?: {
    modelUsed?: string;
    toolsUsed?: string[];
  }) => {
    trackPendoAgentEvent('user_reaction', {
      conversationId: conversationIdRef.current,
      messageId,
      content: reaction,
      modelUsed: options?.modelUsed || 'gpt-4',
      suggestedPrompt: false,
      toolsUsed: options?.toolsUsed || [],
      fileUploaded: false,
    });
  }, []);

  const resetConversation = useCallback(() => {
    conversationIdRef.current = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  return {
    conversationId: conversationIdRef.current,
    trackPrompt,
    trackAgentResponse,
    trackUserReaction,
    resetConversation,
  };
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
