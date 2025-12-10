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

type ChatMessageEvent =
  | "chat.message.create"
  | "chat.message.update"
  | "chat.message.delete"
  | "chat.update"
  | "chat.member.delete"
  | "chat.stat"
  | "chat.initial";

type ChatMessageWebSocketMessage = {
  event: ChatMessageEvent;
  data: any;
};

type ChatMessagesEventHandlers = {
  onMessageCreated?: (data: any) => void;
  onMessageUpdated?: (data: any) => void;
  onMessageDeleted?: (data: any) => void;
  onChatUpdated?: (data: any) => void;
  onMemberDeleted?: (data: any) => void;
  onStatUpdated?: (data: any) => void;
  onInitial?: (data: any) => void;
};

type UseChatMessagesWebSocketProps = {
  chatId?: string;
  enabled?: boolean;
  handlers?: ChatMessagesEventHandlers;
};

/**
 * WebSocket hook for managing messages in a specific chat.
 * Handles real-time message events, typing indicators, reactions, and read receipts.
 */
export function useChatMessagesWebSocket({
  chatId,
  enabled = true,
  handlers = {},
}: UseChatMessagesWebSocketProps) {
  const { user } = useAppStore((s) => s);
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const connectingRef = useRef(false);
  const reconnectTimerRef = useRef<number | null>(null);
  const retriesRef = useRef(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Store handlers, queryClient, and chatId in refs to avoid dependency issues
  const handlersRef = useRef(handlers);
  const queryClientRef = useRef(queryClient);
  const chatIdRef = useRef(chatId);

  useEffect(() => {
    handlersRef.current = handlers;
    queryClientRef.current = queryClient;
    chatIdRef.current = chatId;
  }, [handlers, queryClient, chatId]);

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
      const currentChatId = chatIdRef.current;
      if (!currentChatId) return;

      cleanupSocket();

      const baseWsUrl =
        process.env.NEXT_PUBLIC_WS_URL ||
        (typeof window !== "undefined" && window.location.protocol === "https:"
          ? "wss://"
          : "ws://") +
          (typeof window !== "undefined"
            ? window.location.host
            : "localhost:8082");

      // Connect to specific chat's message stream
      const wsUrl = `${baseWsUrl}/ws/chat/${currentChatId}?token=${token}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("[Chat Messages WS] Connected to chat:", currentChatId);
        // Don't reset retries here - only reset after stable connection
        connectingRef.current = false;
        setIsConnecting(false);
        setIsConnected(true);
      };

      ws.onmessage = (e) => {
        console.log("jjj", e);
        try {
          const msg: ChatMessageWebSocketMessage = JSON.parse(e.data);
          const currentHandlers = handlersRef.current;
          const qc = queryClientRef.current;
          const currentChatId = chatIdRef.current;

          // Reset retries on first successful message (connection is stable)
          if (retriesRef.current > 0) {
            console.log(
              "[Chat Messages WS] Connection stable, resetting retries"
            );
            retriesRef.current = 0;
          }

          switch (msg.event) {
            case "chat.initial":
              currentHandlers.onInitial?.(msg.data);
              break;
            case "chat.message.create":
              currentHandlers.onMessageCreated?.(msg.data);
              // Invalidate messages query to refetch
              qc.invalidateQueries({
                queryKey: [cacheKeys.CHAT_MESSAGES, currentChatId],
              });
              // Also invalidate chat list to update last_message_at
              qc.invalidateQueries({
                queryKey: [cacheKeys.USER_CHATS],
              });
              break;
            case "chat.message.update":
              currentHandlers.onMessageUpdated?.(msg.data);
              // Invalidate to update edited messages or reactions
              qc.invalidateQueries({
                queryKey: [cacheKeys.CHAT_MESSAGES, currentChatId],
              });
              break;
            case "chat.message.delete":
              currentHandlers.onMessageDeleted?.(msg.data);
              // Invalidate to remove deleted messages
              qc.invalidateQueries({
                queryKey: [cacheKeys.CHAT_MESSAGES, currentChatId],
              });
              break;
            case "chat.update":
              currentHandlers.onChatUpdated?.(msg.data);
              // Invalidate to update chat info
              qc.invalidateQueries({
                queryKey: [cacheKeys.CHAT_MESSAGES, currentChatId],
              });
              qc.invalidateQueries({
                queryKey: [cacheKeys.USER_CHATS],
              });
              break;
            case "chat.member.delete":
              currentHandlers.onMemberDeleted?.(msg.data);
              // Invalidate to update member list
              qc.invalidateQueries({
                queryKey: [cacheKeys.CHAT_MESSAGES, currentChatId],
              });
              qc.invalidateQueries({
                queryKey: [cacheKeys.USER_CHATS],
              });
              break;
            case "chat.stat":
              console.log("+++++++++++++++++++=", msg.data);
              currentHandlers.onStatUpdated?.(msg.data);
              break;
            default:
              console.log("[Chat Messages WS] Unknown event:", msg.event);
          }
        } catch (err) {
          console.error("[Chat Messages WS] Invalid message:", err);
        }
      };

      ws.onerror = (err) => {
        console.error("[Chat Messages WS] WebSocket error occurred:", err);
        // Note: The actual error details are not available in the error event
        // Check the onclose event for more information
      };

      ws.onclose = (event) => {
        console.warn(
          "[Chat Messages WS] Connection closed:",
          `Code: ${event.code}`,
          `Reason: ${event.reason || "No reason provided"}`,
          `Clean: ${event.wasClean}`
        );
        setIsConnected(false);
        connectingRef.current = false;
        setIsConnecting(false);

        // Normal close - don't reconnect
        if (event.code === 1000) {
          console.log("[Chat Messages WS] Normal close, not reconnecting");
          return;
        }

        // Auth errors - retry with new token
        if ([1008, 4401, 4403].includes(event.code)) {
          const currentRetries = retriesRef.current;
          console.log(
            `[Chat Messages WS] Auth error, retry ${
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
                console.error(
                  "[Chat Messages WS] Failed to refresh token:",
                  err
                );
                connectingRef.current = false;
                setIsConnecting(false);
              }
            }, delay);
          } else {
            console.error(
              "[Chat Messages WS] Max auth retries reached, giving up"
            );
          }
          return;
        }

        // Other errors - reconnect with exponential backoff
        const currentRetries = retriesRef.current;
        console.log(
          `[Chat Messages WS] Connection lost, retry ${
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
              console.error("[Chat Messages WS] Reconnect failed:", err);
              connectingRef.current = false;
              setIsConnecting(false);
            }
          }, backoff);
        } else {
          console.error("[Chat Messages WS] Max retries reached, giving up");
        }
      };
    },
    [] // No dependencies - uses refs only
  );

  const connect = useCallback(async () => {
    if (!user || !enabled || !chatIdRef.current || connectingRef.current)
      return;

    connectingRef.current = true;
    setIsConnecting(true);

    try {
      const token = await getFreshAccessToken();
      openSocketWithToken(token);
    } catch (err) {
      console.error("[Chat Messages WS] Initial connection failed:", err);
      connectingRef.current = false;
      setIsConnecting(false);
    }
  }, [user, enabled, openSocketWithToken]);

  // Separate effect for connection management
  useEffect(() => {
    let mounted = true;

    const initConnection = async () => {
      if (
        !enabled ||
        !chatId ||
        !user ||
        connectingRef.current ||
        wsRef.current
      )
        return;

      connectingRef.current = true;
      setIsConnecting(true);

      try {
        const token = await getFreshAccessToken();
        if (mounted) {
          openSocketWithToken(token);
        }
      } catch (err) {
        console.error("[Chat Messages WS] Initial connection failed:", err);
        if (mounted) {
          connectingRef.current = false;
          setIsConnecting(false);
        }
      }
    };

    if (enabled && chatId && user) {
      initConnection();
    }

    return () => {
      mounted = false;
      cleanupSocket();
    };
  }, [enabled, chatId, user?.id, openSocketWithToken, cleanupSocket]); // Only re-run when these change

  const sendMessage = useCallback((event: string, data: any) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn("[Chat Messages WS] Cannot send - not connected");
      return false;
    }
    try {
      const payload = JSON.stringify({ event, data });
      console.log("[Chat Messages WS] Sending:", payload);
      ws.send(payload);
      return true;
    } catch (err) {
      console.error("[Chat Messages WS] Error sending message:", err);
      return false;
    }
  }, []);

  const sendChatMessage = useCallback(
    (data: ChatMessageWrite) => {
      return sendMessage("chat.message.create", data);
    },
    [sendMessage]
  );

  const updateMessage = useCallback(
    (data: ChatMessageUpdate, messageId: string) => {
      return sendMessage("chat.message.update", {
        ...data,
        message_id: messageId,
      });
    },
    [sendMessage]
  );

  const deleteMessage = useCallback(
    (messageId: string) => {
      return sendMessage("chat.message.delete", messageId);
    },
    [sendMessage]
  );

  const addReaction = useCallback(
    (messageId: string, data: ChatMessageReactionWrite) => {
      return sendMessage("chat.reaction.create", {
        message_id: messageId,
        data,
      });
    },
    [sendMessage]
  );

  const removeReaction = useCallback(
    (messageId: string, data: ChatMessageReactionWrite) => {
      return sendMessage("chat.reaction.delete", {
        message_id: messageId,
        data,
      });
    },
    [sendMessage]
  );

  const updateChat = useCallback(
    (data: ChatUpdate) => {
      return sendMessage("chat.update", data);
    },
    [sendMessage]
  );

  const removeMember = useCallback(
    (memberId: string) => {
      return sendMessage("chat.member.delete", memberId);
    },
    [sendMessage]
  );

  return {
    isConnected,
    isConnecting,
    sendChatMessage,
    updateMessage,
    deleteMessage,
    addReaction,
    removeReaction,
    updateChat,
    removeMember,
    sendMessage,
    connect,
    disconnect: cleanupSocket,
  };
}
