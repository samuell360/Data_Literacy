/**
 * SSE Progress Connector
 * 
 * Real-time progress updates via Server-Sent Events
 * Handles reconnection, error recovery, and graceful degradation
 */

const BASE_URL = 
  (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_API_BASE_URL) ||
  (typeof window !== 'undefined' ? (window as any).VITE_API_BASE_URL : undefined) ||
  'http://localhost:8000';

export interface SSEHandle {
  close: () => void;
  isConnected: () => boolean;
  reconnect: () => void;
}

export interface SSEOptions {
  onProgressUpdated: (payload: any) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: Event | Error) => void;
  reconnectAttempts?: number;
  reconnectDelay?: number;
}

interface SSEState {
  eventSource: EventSource | null;
  reconnectCount: number;
  reconnectTimer: NodeJS.Timeout | null;
  isClosed: boolean;
}

/**
 * Connect to SSE progress updates stream
 * @param options Configuration options
 * @returns Handle to manage the connection, or null if not available
 */
export function connectSSE(options: SSEOptions): SSEHandle | null {
  const {
    onProgressUpdated,
    onConnected,
    onDisconnected,
    onError,
    reconnectAttempts = 3,
    reconnectDelay = 3000
  } = options;

  // Server-side rendering guard
  if (typeof window === 'undefined') {
    console.debug('SSE: Window not available (SSR context)');
    return null;
  }

  // Check for EventSource support
  if (!window.EventSource) {
    console.warn('SSE: EventSource not supported in this browser');
    return null;
  }

  const token = window.localStorage.getItem('auth_token');
  if (!token) {
    console.debug('SSE: No auth token available');
    return null;
  }

  const state: SSEState = {
    eventSource: null,
    reconnectCount: 0,
    reconnectTimer: null,
    isClosed: false
  };

  /**
   * Create and configure EventSource connection
   */
  function connect(): void {
    if (state.isClosed) {
      console.debug('SSE: Connection closed, skipping reconnect');
      return;
    }

    const currentToken = window.localStorage.getItem('auth_token');
    if (!currentToken) {
      console.debug('SSE: No auth token available for connection');
      return;
    }

    const baseUrl = BASE_URL.replace(/\/$/, '');
    const url = `${baseUrl}/api/v1/progress/events?token=${encodeURIComponent(currentToken)}`;

    try {
      console.log('SSE: Connecting to', baseUrl);
      state.eventSource = new EventSource(url);

      // Connection opened
      state.eventSource.onopen = () => {
        console.log('SSE: Connected');
        state.reconnectCount = 0; // Reset on successful connection
        onConnected?.();
      };

      // Progress update event handler
      state.eventSource.addEventListener('progressUpdated', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          if (data?.payload) {
            onProgressUpdated(data.payload);
          } else {
            console.warn('SSE: Received progress update without payload', data);
          }
        } catch (error) {
          console.error('SSE: Failed to parse progress update', error);
        }
      });

      // Generic message handler (fallback)
      state.eventSource.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          console.debug('SSE: Received message', data);
        } catch (error) {
          console.debug('SSE: Received non-JSON message', event.data);
        }
      };

      // Error handler with reconnection logic
      state.eventSource.onerror = (error: Event) => {
        console.error('SSE: Connection error', error);
        
        const eventSource = state.eventSource;
        if (eventSource && eventSource.readyState === EventSource.CLOSED) {
          onDisconnected?.();
          attemptReconnect();
        }

        onError?.(error);
      };

    } catch (error) {
      console.error('SSE: Failed to create EventSource', error);
      onError?.(error as Error);
      attemptReconnect();
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  function attemptReconnect(): void {
    if (state.isClosed) return;

    if (state.reconnectCount < reconnectAttempts) {
      state.reconnectCount++;
      const delay = reconnectDelay * Math.pow(2, state.reconnectCount - 1); // Exponential backoff
      
      console.log(`SSE: Attempting reconnect ${state.reconnectCount}/${reconnectAttempts} in ${delay}ms`);
      
      state.reconnectTimer = setTimeout(() => {
        cleanup();
        connect();
      }, delay);
    } else {
      console.warn(`SSE: Max reconnection attempts (${reconnectAttempts}) reached`);
      onDisconnected?.();
    }
  }

  /**
   * Cleanup EventSource connection
   */
  function cleanup(): void {
    if (state.reconnectTimer) {
      clearTimeout(state.reconnectTimer);
      state.reconnectTimer = null;
    }

    if (state.eventSource) {
      state.eventSource.close();
      state.eventSource = null;
    }
  }

  /**
   * Close connection permanently
   */
  function close(): void {
    console.log('SSE: Closing connection');
    state.isClosed = true;
    cleanup();
    onDisconnected?.();
  }

  /**
   * Check if currently connected
   */
  function isConnected(): boolean {
    return state.eventSource?.readyState === EventSource.OPEN;
  }

  /**
   * Manually trigger reconnection
   */
  function reconnect(): void {
    if (state.isClosed) {
      console.warn('SSE: Cannot reconnect - connection was closed');
      return;
    }

    console.log('SSE: Manual reconnect triggered');
    state.reconnectCount = 0; // Reset counter for manual reconnect
    cleanup();
    connect();
  }

  // Initial connection
  connect();

  return {
    close,
    isConnected,
    reconnect
  };
}

/**
 * Create a React hook for SSE connection
 * Usage in component:
 * 
 * ```tsx
 * const { isConnected, reconnect } = useSSE({
 *   onProgressUpdated: (payload) => {
 *     console.log('Progress updated:', payload);
 *   }
 * });
 * ```
 */
export function createSSEHook() {
  // This would be imported from React in actual usage
  return function useSSE(options: Omit<SSEOptions, 'onConnected' | 'onDisconnected' | 'onError'> & {
    onConnected?: () => void;
    onDisconnected?: () => void;
    onError?: (error: Event | Error) => void;
    enabled?: boolean;
  }) {
    const { enabled = true, ...sseOptions } = options;
    
    // Note: In actual React usage, you'd use useState and useEffect here
    // This is just a template for the hook structure
    
    return {
      isConnected: false,
      reconnect: () => console.log('Reconnect not available without React'),
      close: () => console.log('Close not available without React')
    };
  };
}

/**
 * Heartbeat monitor to detect stale connections
 */
export function createHeartbeatMonitor(
  sseHandle: SSEHandle | null,
  timeout: number = 60000
): { stop: () => void } | null {
  if (!sseHandle) return null;

  let lastHeartbeat = Date.now();
  let checkInterval: NodeJS.Timeout;

  // Update heartbeat on any activity
  const updateHeartbeat = () => {
    lastHeartbeat = Date.now();
  };

  // Check for stale connection
  checkInterval = setInterval(() => {
    const timeSinceLastHeartbeat = Date.now() - lastHeartbeat;
    
    if (timeSinceLastHeartbeat > timeout) {
      console.warn('SSE: Connection appears stale, reconnecting...');
      sseHandle.reconnect();
      updateHeartbeat(); // Reset after reconnect attempt
    }
  }, timeout / 2);

  return {
    stop: () => {
      clearInterval(checkInterval);
    }
  };
}