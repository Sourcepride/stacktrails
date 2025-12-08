import { appFetch } from "@/lib/appFetch";
import { cacheKeys } from "@/lib/cacheKeys";
import { BackendRoutes } from "@/routes";
import { useAppStore } from "@/store";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

const MAX_RETRIES = 5;
const AUTH_MAX_RETRIES = 5;
const RECONNECT_DELAY = 1000;

async function getFreshAccessToken(): Promise<string> {
  const { data } = await appFetch<{ access_token: string }>(
    BackendRoutes.WS_SHORT_LIVED,
    { credentials: "include" }
  );
  return data.access_token;
}

type ChatsSyncEvent =
  | "chat.create"
  | "chat.direct.add"
  | "chat.accept"
  | "chat.join_public"
  | "chat.update"
  | "chat.stat";

type ChatsSyncMessage = {
  event: ChatsSyncEvent;
  data: any;
};

type ChatsSyncEventHandlers = {
  onChatCreated?: (data: any) => void;
  onAccept?: (data: any) => void;
  onChatUpdated?: (data: any) => void;
  onStatUpdated?: (data: any) => void;
};

type UseChatsSyncWebSocketProps = {
  enabled?: boolean;
  handlers?: ChatsSyncEventHandlers;
};

/**
 * WebSocket hook for syncing the user's chat list.
 * Listens for events that affect the chat list order and updates:
 * - New chats created
 * - Chat updates (name, avatar, etc.)
 * - New messages (to update last_message_at and unread counts)
 */
export function useChatsSyncWebSocket({
  enabled = true,
  handlers = {},
}: UseChatsSyncWebSocketProps = {}) {
  const { user } = useAppStore((s) => s);
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const connectingRef = useRef(false);
  const reconnectTimerRef = useRef<number | null>(null);
  const retriesRef = useRef(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Store handlers and queryClient in refs to avoid dependency issues
  const handlersRef = useRef(handlers);
  const queryClientRef = useRef(queryClient);

  useEffect(() => {
    handlersRef.current = handlers;
    queryClientRef.current = queryClient;
  }, [handlers, queryClient]);

  const cleanupSocket = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onerror = null;
      wsRef.current.onclose = null;
      try {
        wsRef.current.close(1000, "cleanup");
      } catch (e) {
        // ignore
      }
      wsRef.current = null;
    }
    connectingRef.current = false;
    setIsConnecting(false);
    setIsConnected(false);
  }, []);

  const openSocketWithToken = useCallback(
    (token: string) => {
      cleanupSocket();

      const baseWsUrl =
        process.env.NEXT_PUBLIC_WS_URL ||
        (typeof window !== "undefined" && window.location.protocol === "https:"
          ? "wss://"
          : "ws://") +
          (typeof window !== "undefined"
            ? window.location.host
            : "localhost:8082");

      //     // Connect to user's chat list sync endpoint
      const wsUrl = `${baseWsUrl}/ws/chat/?token=${token}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("[Chats Sync WS] Connected");
        // Don't reset retries here - only reset after stable connection
        connectingRef.current = false;
        setIsConnecting(false);
        setIsConnected(true);
      };

      ws.onmessage = (e) => {
        try {
          const msg: ChatsSyncMessage = JSON.parse(e.data);
          const currentHandlers = handlersRef.current;
          const qc = queryClientRef.current;

          // Reset retries on first successful message (connection is stable)
          if (retriesRef.current > 0) {
            console.log("[Chats Sync WS] Connection stable, resetting retries");
            retriesRef.current = 0;
          }

          switch (msg.event) {
            case "chat.create":
              currentHandlers.onChatCreated?.(msg.data as ChatRead);
              // Invalidate chat list to refetch
              qc.invalidateQueries({
                queryKey: [cacheKeys.USER_CHATS],
              });
              break;
            case "chat.accept":
              currentHandlers.onAccept?.(msg.data as ChatMemberRead);
              // Invalidate to update chat info
              qc.invalidateQueries({
                queryKey: [cacheKeys.USER_CHATS],
              });
              break;
            case "chat.join_public":
              currentHandlers.onAccept?.(msg.data as ChatMemberRead);
              // Invalidate to remove deleted chat
              qc.invalidateQueries({
                queryKey: [cacheKeys.USER_CHATS],
              });
              break;
            case "chat.direct.add":
              currentHandlers.onChatCreated?.(msg.data as ChatRead);
              // Invalidate to update last_message_at and unread counts
              qc.invalidateQueries({
                queryKey: [cacheKeys.USER_CHATS],
              });
              break;
            case "chat.update":
              currentHandlers.onChatUpdated?.(msg.data);
              // Invalidate to update chat info (name, avatar, etc.)
              break;
            case "chat.stat":
              currentHandlers.onStatUpdated?.(msg.data);
              // Update unread counts in chat list
              break;
            default:
              console.log("[Chats Sync WS] Unknown event:", msg.event);
          }
        } catch (err) {
          console.error("[Chats Sync WS] Invalid message:", err);
        }
      };

      ws.onerror = (err) => {
        console.error("[Chats Sync WS] Error:", err);
      };

      ws.onclose = (event) => {
        console.warn("[Chats Sync WS] Closed:", event.code, event.reason);
        setIsConnected(false);
        connectingRef.current = false;
        setIsConnecting(false);

        // Normal close - don't reconnect
        if (event.code === 1000) {
          return;
        }

        // Auth errors - retry with new token
        if ([1008, 4401, 4403].includes(event.code)) {
          const currentRetries = retriesRef.current;
          console.log(
            `[Chats Sync WS] Auth error, retry ${
              currentRetries + 1
            }/${AUTH_MAX_RETRIES}`
          );

          if (currentRetries < AUTH_MAX_RETRIES) {
            retriesRef.current = currentRetries + 1;
            const delay = RECONNECT_DELAY * retriesRef.current;

            reconnectTimerRef.current = window.setTimeout(async () => {
              try {
                const newToken = await getFreshAccessToken();
                openSocketWithToken(newToken);
              } catch (err) {
                console.error("[Chats Sync WS] Failed to refresh token:", err);
                connectingRef.current = false;
                setIsConnecting(false);
              }
            }, delay);
          } else {
            console.error(
              "[Chats Sync WS] Max auth retries reached, giving up"
            );
          }
          return;
        }

        // Other errors - reconnect with exponential backoff
        const currentRetries = retriesRef.current;
        console.log(
          `[Chats Sync WS] Connection lost, retry ${
            currentRetries + 1
          }/${MAX_RETRIES}`
        );

        if (currentRetries < MAX_RETRIES) {
          retriesRef.current = currentRetries + 1;
          const backoff = Math.min(
            RECONNECT_DELAY * Math.pow(2, retriesRef.current),
            30000
          );

          reconnectTimerRef.current = window.setTimeout(async () => {
            try {
              const token = await getFreshAccessToken();
              openSocketWithToken(token);
            } catch (err) {
              console.error("[Chats Sync WS] Reconnect failed:", err);
              connectingRef.current = false;
              setIsConnecting(false);
            }
          }, backoff);
        } else {
          console.error("[Chats Sync WS] Max retries reached, giving up");
        }
      };
    },
    [] // No dependencies - uses refs only
  );

  const connect = useCallback(async () => {
    if (!user || !enabled || connectingRef.current) return;

    connectingRef.current = true;
    setIsConnecting(true);

    try {
      const token = await getFreshAccessToken();
      openSocketWithToken(token);
    } catch (err) {
      console.error("[Chats Sync WS] Initial connection failed:", err);
      connectingRef.current = false;
      setIsConnecting(false);
    }
  }, [user, enabled, openSocketWithToken]);

  const sendMessage = useCallback((event: string, data: any) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn(
        "[Chats Sync WS] Cannot send - not connected. ReadyState:",
        ws?.readyState
      );
      return false;
    }
    console.log(`[Chats Sync WS] Sending event: ${event}`, data);
    ws.send(JSON.stringify({ event, data }));
    return true;
  }, []);

  const subscribe = useCallback(
    (data: string) => {
      return sendMessage("chat.subscribe", data);
    },
    [sendMessage]
  );

  const unsubscribe = useCallback(
    (data: string) => {
      return sendMessage("chat.unsubscribe", {
        data,
      });
    },
    [sendMessage]
  );

  // Separate effect for connection management
  useEffect(() => {
    let mounted = true;

    const initConnection = async () => {
      if (!enabled || !user || connectingRef.current || wsRef.current) return;

      connectingRef.current = true;
      setIsConnecting(true);

      try {
        const token = await getFreshAccessToken();
        if (mounted) {
          openSocketWithToken(token);
        }
      } catch (err) {
        console.error("[Chats Sync WS] Initial connection failed:", err);
        if (mounted) {
          connectingRef.current = false;
          setIsConnecting(false);
        }
      }
    };

    if (enabled && user) {
      initConnection();
    }

    return () => {
      mounted = false;
      cleanupSocket();
    };
  }, [enabled, user?.id, openSocketWithToken, cleanupSocket]); // Stable deps

  return {
    isConnected,
    isConnecting,
    connect,
    disconnect: cleanupSocket,
    subscribe,
    unsubscribe,
  };
}
