import { appFetch } from "@/lib/appFetch";
import { BackendRoutes } from "@/routes";
import { useAppStore } from "@/store";
import { useCallback, useEffect, useRef, useState } from "react";

const MAX_RETRIES = 5; // for non-auth reconnects
const AUTH_MAX_RETRIES = 5; // number of times to retry getting new WS token on auth failure

async function getFreshAccessToken(): Promise<string> {
  const { data } = await appFetch<{ access_token: string }>(
    BackendRoutes.WS_SHORT_LIVED,
    { credentials: "include" }
  );
  return data.access_token;
}

// Define a clearer type for the props
type AnnotationSyncProps = {
  docId?: string;
  syncAnnotation?: boolean;
  onCreate: (data: any) => void;
  onUpdate: (data: any) => void;
  onDelete: (data: any) => void;
};

export default function useAnnotationSync({
  docId,
  syncAnnotation = false,
  onCreate,
  onUpdate,
  onDelete,
}: AnnotationSyncProps) {
  const { user } = useAppStore((s) => s);
  const wsRef = useRef<WebSocket | null>(null);
  const connectingRef = useRef(false); // prevents parallel connects
  const reconnectTimerRef = useRef<number | null>(null);
  const authRetriesRef = useRef(0);
  const generalRetriesRef = useRef(0);
  const [isConnecting, setIsConnecting] = useState(false);

  // --- START FIX ---
  // Store handlers in refs to avoid them being dependency array triggers
  const handlersRef = useRef({ onCreate, onUpdate, onDelete });

  // Update refs whenever the prop functions change
  useEffect(() => {
    handlersRef.current = { onCreate, onUpdate, onDelete };
  }, [onCreate, onUpdate, onDelete]);
  // --- END FIX ---

  const cleanupSocket = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (wsRef.current) {
      // clear handlers to prevent old closures from firing
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
  }, []);

  // Central function that actually opens a socket for a given token.
  const openSocketWithToken = useCallback(
    (token: string) => {
      // ensure previous socket is cleaned
      cleanupSocket();

      // build ws url: prefer env if set, else derive from window
      const baseWsUrl =
        process.env.NEXT_PUBLIC_WS_URL ||
        (typeof window !== "undefined" && window.location.protocol === "https:"
          ? "wss://"
          : "ws://") +
          (typeof window !== "undefined"
            ? window.location.host
            : "localhost:8082");

      const wsUrl = `${baseWsUrl}/ws/documents/${docId}/annotations?token=${token}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("[Annotation WS] Connected");
        // success → reset retry counters
        authRetriesRef.current = 0;
        generalRetriesRef.current = 0;
        connectingRef.current = false;
        setIsConnecting(false);
      };

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          // --- START FIX ---
          // Read the *current* handler from the ref
          const {
            onCreate: currentOnCreate,
            onUpdate: currentOnUpdate,
            onDelete: currentOnDelete,
          } = handlersRef.current;

          switch (msg.event) {
            case "annotation.created":
              currentOnCreate?.(msg.data);
              break;
            case "annotation.updated":
              currentOnUpdate?.(msg.data);
              break;
            case "annotation.deleted":
              currentOnDelete?.(msg.data);
              break;
            default:
              console.log("[Annotation WS] Unknown event:", msg.event);
          }
          // --- END FIX ---
        } catch (err) {
          console.error("[Annotation WS] Invalid message:", err);
        }
      };

      ws.onerror = (err) => {
        // log errors; don't attempt reconnect here, wait for onclose
        console.error("[Annotation WS] Error:", err);
      };

      ws.onclose = (event) => {
        console.warn("[Annotation WS] Closed:", event.code, event.reason);

        // AUTH-related codes: try refreshing token a few times
        if ([1008, 4401, 4403].includes(event.code)) {
          authRetriesRef.current += 1;
          if (authRetriesRef.current <= AUTH_MAX_RETRIES) {
            console.warn(
              `[Annotation WS] Auth close (code=${event.code}). Attempting token refresh (${authRetriesRef.current}/${AUTH_MAX_RETRIES})...`
            );
            // try to fetch new token and reconnect (no recursion of handlers)
            (async () => {
              try {
                const newToken = await getFreshAccessToken();
                // small delay to avoid thundering
                reconnectTimerRef.current = window.setTimeout(() => {
                  openSocketWithToken(newToken);
                  reconnectTimerRef.current = null;
                }, 300 + 200 * authRetriesRef.current); // gradual increase
              } catch (err) {
                console.error("[Annotation WS] Failed to refresh token:", err);
                if (authRetriesRef.current >= AUTH_MAX_RETRIES) {
                  console.warn(
                    "[Annotation WS] Max auth retries reached — not reconnecting."
                  );
                } else {
                  // schedule another attempt after delay
                  reconnectTimerRef.current = window.setTimeout(() => {
                    // attempt to fetch again
                    (async () => {
                      try {
                        const newToken2 = await getFreshAccessToken();
                        openSocketWithToken(newToken2);
                      } catch (err2) {
                        console.error(
                          "[Annotation WS] Retry token fetch failed:",
                          err2
                        );
                      }
                    })();
                  }, 1000 * authRetriesRef.current);
                }
              }
            })();
          } else {
            console.warn("[Annotation WS] Auth retries exhausted — giving up.");
          }
          return;
        }

        // Normal/other close: try reconnect with exponential backoff, capped
        if (event.code !== 1000) {
          generalRetriesRef.current += 1;
          if (generalRetriesRef.current > MAX_RETRIES) {
            console.warn(
              "[Annotation WS] General retries exhausted — giving up."
            );
            return;
          }
          const backoff = Math.min(2000 * generalRetriesRef.current, 15000);
          console.log(
            `[Annotation WS] Reconnecting in ${backoff}ms (attempt ${generalRetriesRef.current}/${MAX_RETRIES})`
          );
          reconnectTimerRef.current = window.setTimeout(async () => {
            try {
              const token = await getFreshAccessToken(); // you may choose to reuse last token, but safe to refresh
              openSocketWithToken(token);
            } catch (err) {
              console.error(
                "[Annotation WS] Failed to get token for reconnect:",
                err
              );
            }
          }, backoff);
        } else {
          // normal closure 1000 — cleanup but do not reconnect
          cleanupSocket();
        }
      };
    },
    // --- START FIX ---
    // Remove handler props from the dependency array
    [docId, cleanupSocket]
    // --- END FIX ---
  );

  // Top-level connect function: coordinates fetching initial token and opening socket
  const connectWebSocket = useCallback(async () => {
    if (!user || !syncAnnotation || !docId) return;
    if (connectingRef.current) return;
    connectingRef.current = true;
    setIsConnecting(true);
    try {
      const token = await getFreshAccessToken();
      openSocketWithToken(token);
    } catch (err) {
      console.error("[Annotation WS] Initial token fetch failed:", err);
      connectingRef.current = false;
      setIsConnecting(false);
      // If initial token fetch fails, do not spam immediate retries here.
    }
  }, [user, syncAnnotation, docId, openSocketWithToken]);

  useEffect(() => {
    if (user && syncAnnotation && docId) {
      connectWebSocket();
    }
    return () => {
      // cleanup on unmount or deps change
      cleanupSocket();
    };
  }, [user, syncAnnotation, docId, connectWebSocket, cleanupSocket]);

  // --- Emitters (reuse your existing send logic) ---
  const sendMessage = useCallback((event: any, data: any) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn("[Annotation WS] Tried to send but not connected:", event);
      return;
    }
    ws.send(JSON.stringify({ event, data }));
  }, []);

  const createAnnotation = useCallback(
    (data: any) => sendMessage("annotation.create", data),
    [sendMessage]
  );
  const updateAnnotation = useCallback(
    (data: any) => sendMessage("annotation.update", data),
    [sendMessage]
  );
  const deleteAnnotation = useCallback(
    (id: string) => sendMessage("annotation.delete", { id }),
    [sendMessage]
  );

  return {
    createAnnotation,
    updateAnnotation,
    deleteAnnotation,
  };
}
