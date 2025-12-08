import ChatHeader from "@/components/chats/fragments/ChatHeader";
import ChatInputBox from "@/components/chats/fragments/input/ChatInputBox";
import Message from "@/components/chats/fragments/message/Message";
import ScrollToBottomButton from "@/components/chats/fragments/ScrollToBottomButton";
import { useChatMessagesWebSocket } from "@/components/chats/hooks/useChatMessagesWebSocket";
import { useScrollPosition } from "@/components/chats/hooks/useScrollPosition";
import appAxios from "@/lib/axiosClient";
import { cacheKeys } from "@/lib/cacheKeys";
import { BackendRoutes } from "@/routes";
import { useAppStore } from "@/store";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";

type ChatMainProps = {
  chat: ChatRead;
  clearCurrentChat: () => void;
};

type NewerMessagesInfo = {
  count: number;
  hasReply: boolean;
};

export default function ChatMain({ chat, clearCurrentChat }: ChatMainProps) {
  const { user } = useAppStore((state) => state);
  const [messages, setMessages] = useState<ChatMessageRead[]>([]);
  const [hasNewerMessages, setHasNewerMessages] =
    useState<NewerMessagesInfo | null>(null);
  const [isFetchingOlder, setIsFetchingOlder] = useState(false);
  const scrollContainerRef = useRef<HTMLElement>(null);
  const userSentMessageRef = useRef(false);
  const chatIdRef = useRef({ chatId: "", initScroll: false });
  const oldestMessageIdRef = useRef<string | null>(null);

  // Use sync external store to track scroll position
  const scrollPosition = useScrollPosition(scrollContainerRef, 100);

  // Function to scroll to bottom
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });
  };

  // Function to mark all messages as read
  const markAllAsRead = async () => {
    try {
      await appAxios.patch(BackendRoutes.MARK_CHAT_AS_READ(chat.id));
      console.log("[ChatMain] Marked all messages as read");
    } catch (error) {
      console.error("[ChatMain] Error marking messages as read:", error);
    }
  };

  const { data: memberData, isLoading: isLoadingMembers } = useQuery({
    queryKey: [cacheKeys.CHAT_MEMBERS, chat.id],
    queryFn: async (): Promise<PaginatedChatMemberRead> => {
      const resp = await appAxios.get(BackendRoutes.LIST_CHAT_MEMBERS(chat.id));
      return resp.data;
    },
  });

  const handlers = useMemo(
    () => ({
      onInitial: (msg: PaginatedMessagesResp) => {
        const reversedMessages = msg.items.reverse();
        setMessages(reversedMessages);

        // Set the oldest message ID (first in the array after reverse)
        if (reversedMessages.length > 0) {
          oldestMessageIdRef.current = reversedMessages[0].id;
          console.log(
            "[ChatMain] Oldest message ID set:",
            oldestMessageIdRef.current
          );
        }

        // Mark all messages as read on initial load
        markAllAsRead();
      },
      onMessageCreated: (msg: ChatMessageRead) => {
        setMessages((prev) => [...prev, msg]);

        // Check if user is scrolled up (using sync external store)
        if (scrollPosition.distanceFromBottom > 100) {
          // User is scrolled up, track new message
          setHasNewerMessages((prev) => {
            // Check if message is a reply to current user
            const isReplyToUser = msg.reply_to_id === user?.id;

            if (prev === null) {
              // Create new object
              return {
                count: 1,
                hasReply: isReplyToUser,
              };
            } else {
              // Increment count and update hasReply
              return {
                count: prev.count + 1,
                hasReply: prev.hasReply || isReplyToUser,
              };
            }
          });
        } else if (scrollPosition.isNearBottom) {
          // User is near bottom, mark as read
          markAllAsRead();
        }
      },
      onMessageUpdated: (data: ChatMessageRead) => {
        setMessages((prev) =>
          prev.map((d) => {
            if (d.id === data.id) return data;
            return d;
          })
        );
      },
      onMessageDeleted: (data: any) => {
        setMessages((prev) =>
          prev.map((d) => {
            if (d.id === data.id) return data;
            return d;
          })
        );
      },
      onStatUpdated: (msg: ChatStatRead) => {},
    }),
    []
  );
  const { isConnected, sendChatMessage, updateMessage, deleteMessage } =
    useChatMessagesWebSocket({
      chatId: chat.id,
      handlers,
    });

  useEffect(() => {
    if (chatIdRef.current.chatId !== chat.id) {
      chatIdRef.current = { chatId: chat.id, initScroll: false };
    }

    if (messages.length > 0 && !chatIdRef.current.initScroll) {
      scrollToBottom("auto");
      chatIdRef.current = { ...chatIdRef.current, initScroll: true };
    }
  }, [chat.id, messages]);

  // Handle auto-scroll when new messages arrive
  useEffect(() => {
    if (messages.length === 0) return;

    // If user sent the message, always scroll to bottom
    if (userSentMessageRef.current) {
      scrollToBottom("smooth");
      userSentMessageRef.current = false;
      setHasNewerMessages(null); // Clear new messages indicator
      return;
    }

    // If user is near bottom, auto-scroll to bottom
    if (scrollPosition.isNearBottom) {
      scrollToBottom("smooth");
      setHasNewerMessages(null); // Cl ear new messages indicator
    }
    // Otherwise, don't scroll - user has scrolled up to read older messages
  }, [messages]);

  // Fetch older messages when scrolling to top
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScrollToTop = async () => {
      const { scrollTop } = container;

      // If scrolled near top (within 50px) and not already fetching
      if (scrollTop < 50 && !isFetchingOlder && oldestMessageIdRef.current) {
        console.log("[ChatMain] Fetching older messages...", {
          oldestMessageId: oldestMessageIdRef.current,
          scrollTop,
        });

        setIsFetchingOlder(true);

        try {
          const response = await appAxios.get(
            BackendRoutes.GET_CHAT_MESSAGES(chat.id),
            {
              params: {
                before: oldestMessageIdRef.current,
              },
            }
          );

          const data: PaginatedMessages = response.data;
          const olderMessages: ChatMessageRead[] = data.items || [];

          if (olderMessages.length > 0) {
            console.log(
              `[ChatMain] Fetched ${olderMessages.length} older messages`
            );

            // Save current scroll position
            const prevScrollHeight = container.scrollHeight;
            const prevScrollTop = container.scrollTop;

            // Prepend older messages (reverse because API returns newest first)
            setMessages((prev) => [...olderMessages.reverse(), ...prev]);

            // Update oldest message ID reference to the new oldest
            oldestMessageIdRef.current =
              olderMessages[olderMessages.length - 1].id;
            console.log(
              "[ChatMain] New oldest message ID:",
              oldestMessageIdRef.current
            );

            // Maintain scroll position after DOM updates
            // This prevents the "jump" effect when prepending messages
            requestAnimationFrame(() => {
              const newScrollHeight = container.scrollHeight;
              const heightDifference = newScrollHeight - prevScrollHeight;
              container.scrollTop = prevScrollTop + heightDifference;
              console.log("[ChatMain] Scroll position maintained", {
                heightDifference,
                newScrollTop: container.scrollTop,
              });
            });
          } else {
            console.log("[ChatMain] No more older messages available");
            // No more messages exist, prevent further fetch attempts
            oldestMessageIdRef.current = null;
          }
        } catch (error) {
          console.error("[ChatMain] Error fetching older messages:", error);
        } finally {
          setIsFetchingOlder(false);
        }
      }
    };

    container.addEventListener("scroll", handleScrollToTop);
    return () => {
      container.removeEventListener("scroll", handleScrollToTop);
    };
  }, [chat.id, isFetchingOlder]);

  return (
    <section className="bg-gray-100 flex flex-col justify-items-stretch items-stretch h-full relative">
      <ChatHeader
        data={chat}
        members={memberData?.items || []}
        onBack={clearCurrentChat}
        onSearch={() => {}}
        onDateFilter={() => {}}
      />

      <section
        ref={scrollContainerRef}
        className="relative grow overflow-y-auto px-4 py-4"
      >
        {/* Loading indicator for older messages */}
        {isFetchingOlder && (
          <div className="flex justify-center py-4">
            <div className="flex flex-col gap-2 items-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-gray-500">Loading older messages...</p>
            </div>
          </div>
        )}

        <div className="flex flex-col">
          {messages.map((message) => (
            <Message
              key={message.id}
              message={message}
              onEdit={(messageId, content) => {
                updateMessage({ content }, messageId);
              }}
              onDelete={(messageId) => {
                deleteMessage(messageId);
              }}
            />
          ))}
        </div>
      </section>

      {/* Scroll to Bottom Button */}
      <ScrollToBottomButton
        show={scrollPosition.distanceFromBottom > 100}
        onClick={() => {
          scrollToBottom("smooth");
          setHasNewerMessages(null);
        }}
        newerMessages={hasNewerMessages}
      />

      <ChatInputBox
        onSend={(message: string) => {
          userSentMessageRef.current = true; // Mark that user sent this message
          const result = sendChatMessage({
            chat_id: chat.id,
            content: message,
            message_type: "text",
          });
          console.log("[ChatMain] Message send result:", result);
        }}
      />
    </section>
  );
}
