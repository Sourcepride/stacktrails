import LoadingComponent from "@/common/utils/LoadingComponent";
import { useChatContext } from "@/components/chats/context/ChatContext";
import { useChatsSyncWebSocket } from "@/components/chats/hooks/useChatsSyncWebSocket";
import { deBounce } from "@/lib/debounce";
import { Skeleton } from "@mui/material";
import { IoSearch } from "@react-icons/all-files/io5/IoSearch";
import { InfiniteData } from "@tanstack/react-query";
import { Dispatch, SetStateAction, useEffect, useMemo, useRef } from "react";
import ChatLog from "./fragments/ChatLog";

type ChatLogsPanelProps = {
  data: InfiniteData<PaginatedChatResp, unknown> | undefined;
  isLoadingChats: boolean;
  isFetchingChats: boolean;
  fetchChatsNextPage: () => void;
  error: Error | null;
  setActiveChat: Dispatch<SetStateAction<ChatRead | null>>;
  activeChatId: string | null;
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  hasNextPage?: boolean;
};

export default function ChatLogsPanel({
  data,
  isLoadingChats,
  isFetchingChats,
  error,
  fetchChatsNextPage,
  setActiveChat,
  activeChatId,
  search,
  setSearch,
  hasNextPage = false,
}: ChatLogsPanelProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Get chat state from context
  const { localChats, updateChatStats, addNewChat, updateChat } =
    useChatContext();

  // Debounced search handler - memoized to prevent re-renders
  const debouncedSearch = useMemo(
    () =>
      deBounce((value: string) => {
        setSearch(value);
      }, 500),
    [setSearch]
  );

  // Memoize handlers to prevent unnecessary re-renders
  const chatSyncHandlers = useMemo(
    () => ({
      onChatCreated: (newChat: ChatRead) => {
        console.log("[ChatLogsPanel] Chat created:", newChat);
        addNewChat(newChat);
      },
      onAccept: (data: any) => {
        console.log("[ChatLogsPanel] Chat accepted:", data);
        // TODO: Handle chat acceptance
      },
      onChatUpdated: (updatedChat: ChatRead) => {
        console.log("[ChatLogsPanel] Chat updated:", updatedChat);
        updateChat(updatedChat);
      },
      onStatUpdated: (statData: ChatStatRead) => {
        console.log("[ChatLogsPanel] Stats updated:", statData);
        updateChatStats(statData.chat_id, {
          unread_count: statData.unread_count,
          has_reply: statData.has_reply,
        });
      },
    }),
    [addNewChat, updateChat, updateChatStats]
  );

  const { isConnected, subscribe, unsubscribe } = useChatsSyncWebSocket({
    handlers: chatSyncHandlers,
  });

  useEffect(() => {
    // Only subscribe when WebSocket is actually connected
    if (!isConnected) {
      console.log(
        "[ChatLogsPanel] WebSocket not connected, skipping subscription"
      );
      return;
    }

    if (isLoadingChats || isFetchingChats || localChats.length === 0) {
      console.log("[ChatLogsPanel] Data not ready, skipping subscription");
      return;
    }

    console.log("[ChatLogsPanel] Subscribing to chats...");
    const chatIds: string[] = [];

    localChats.forEach(({ chat }) => {
      chatIds.push(chat.id);
      const result = subscribe(chat.id);
      console.log(`[ChatLogsPanel] Subscribe to ${chat.id}:`, result);
    });

    return () => {
      console.log("[ChatLogsPanel] Unsubscribing from chats...");
      chatIds.forEach((chatId) => {
        const result = unsubscribe(chatId);
        console.log(`[ChatLogsPanel] Unsubscribe from ${chatId}:`, result);
      });
    };
  }, [
    isLoadingChats,
    isFetchingChats,
    localChats,
    isConnected,
    subscribe,
    unsubscribe,
  ]);

  // Scroll pagination handler
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const scrolledToBottom = scrollHeight - scrollTop - clientHeight < 100;

      // Load more when scrolled near bottom
      if (scrolledToBottom && hasNextPage && !isFetchingChats) {
        console.log("[ChatLogsPanel] Loading more chats...");
        fetchChatsNextPage();
      }
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, [hasNextPage, isFetchingChats, fetchChatsNextPage]);

  return (
    <section className="flex flex-col h-full relative">
      {/* search area */}
      <div className="p-4 border-b sticky top-0 z-10 bg-white">
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search chats..."
            defaultValue={search}
            onChange={deBounce(() => {
              debouncedSearch(searchInputRef.current?.value || "");
            }, 500)}
            className="w-full px-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            aria-label="Search chats"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <IoSearch className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* list of chats */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        <LoadingComponent
          loading={isLoadingChats}
          data={data}
          empty={!data?.pages.length}
          error={!!error}
          loadingComponent={
            <div className="flex flex-col gap-4 p-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton
                  key={index}
                  variant="rectangular"
                  width="100%"
                  height={80}
                  sx={{ borderRadius: 2 }}
                />
              ))}
            </div>
          }
        >
          {() =>
            localChats.map(
              ({ chat, has_reply, unread_count, last_message }) => {
                const metadata = {
                  unreadCount: unread_count || 0,
                  hasReply: has_reply || false,
                  lastMessage: last_message?.content || "No messages yet",
                };

                return (
                  <ChatLog
                    key={chat.id}
                    data={chat}
                    unreadCount={metadata.unreadCount}
                    hasReply={metadata.hasReply}
                    isActive={activeChatId === chat.id}
                    lastMessage={metadata.lastMessage}
                    onClick={() => setActiveChat(chat)}
                  />
                );
              }
            )
          }
        </LoadingComponent>

        {/* Loading indicator for pagination */}
        {isFetchingChats && !isLoadingChats && (
          <div className="flex justify-center py-4">
            <div className="flex flex-col gap-2 items-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-gray-500">Loading more chats...</p>
            </div>
          </div>
        )}
      </div>

      {/* search result list */}
    </section>
  );
}
