"use client";

import ChatLogsPanel from "@/components/chats/ChatLogsPanel";
import ChatMain from "@/components/chats/ChatMain";
import {
  ChatProvider,
  useChatContext,
} from "@/components/chats/context/ChatContext";
import { useChatsSyncWebSocket } from "@/components/chats/hooks/useChatsSyncWebSocket";
import appAxios from "@/lib/axiosClient";
import { cacheKeys } from "@/lib/cacheKeys";
import { BackendRoutes } from "@/routes";
import { useAppStore } from "@/store";
import {
  InfiniteData,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Dispatch, SetStateAction, useMemo, useState } from "react";

type CourseChatProps = {
  courseId: string;
};

// Inner component that has access to ChatContext
function CourseChatContent({
  courseId,
  users_chats,
  isLoadingChats,
  isFetchingChats,
  fetchChatsNextPage,
  error,
  hasNextPage,
  setActiveChat,
  activeChat,
  search,
  setSearch,
  queryClient,
  user,
}: {
  courseId: string;
  users_chats: InfiniteData<PaginatedChatResp, unknown> | undefined;
  isLoadingChats: boolean;
  isFetchingChats: boolean;
  fetchChatsNextPage: () => void;
  error: Error | null;
  hasNextPage: boolean;
  setActiveChat: Dispatch<SetStateAction<ChatRead | null>>;
  activeChat: ChatRead | null;
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  queryClient: ReturnType<typeof useQueryClient>;
  user: any;
}) {
  const { localChats, updateChatStats, addNewChat, updateChat } =
    useChatContext();

  // WebSocket handlers - use context functions
  const chatSyncHandlers = useMemo(
    () => ({
      onChatCreated: (newChat: ChatRead) => {
        console.log("[CourseChat] Chat created:", newChat);
        addNewChat(newChat);
      },
      onAccept: (data: any) => {
        console.log("[CourseChat] Chat accepted:", data);
        // TODO: Handle chat acceptance
      },
      onChatUpdated: (updatedChat: ChatRead) => {
        console.log("[CourseChat] Chat updated:", updatedChat);
        updateChat(updatedChat);
      },
      onStatUpdated: (statData: ChatStatRead) => {
        console.log("[CourseChat] Stats updated:", statData);
        updateChatStats(statData.chat_id, {
          unread_count: statData.unread_count,
          has_reply: statData.has_reply,
        });
      },
    }),
    [addNewChat, updateChat, updateChatStats]
  );

  // WebSocket connection - stays alive regardless of view
  const { isConnected, subscribe, unsubscribe } = useChatsSyncWebSocket({
    handlers: chatSyncHandlers,
  });

  return (
    <section className="border border-gray-300 h-full">
      {!activeChat && (
        <ChatLogsPanel
          data={users_chats}
          isLoadingChats={isLoadingChats}
          isFetchingChats={isFetchingChats}
          fetchChatsNextPage={fetchChatsNextPage}
          error={error}
          setActiveChat={setActiveChat}
          activeChatId={null}
          search={search}
          setSearch={setSearch}
          hasNextPage={hasNextPage}
          // Pass WebSocket functions as props
          isConnected={isConnected}
          subscribe={subscribe}
          unsubscribe={unsubscribe}
        />
      )}
      {activeChat && (
        <ChatMain
          chat={activeChat}
          clearCurrentChat={() => {
            setActiveChat(null);
            queryClient.invalidateQueries({
              queryKey: [cacheKeys.USER_CHATS, user?.id],
            });
          }}
        />
      )}
    </section>
  );
}

const CourseChat: React.FC<CourseChatProps> = ({ courseId }) => {
  const [activeChat, setActiveChat] = useState<ChatRead | null>(null);
  const { user } = useAppStore((state) => state);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const {
    data: users_chats,
    isLoading: isLoadingChats,
    isFetching: isFetchingChats,
    fetchNextPage: fetchChatsNextPage,
    hasNextPage,
    error,
  } = useInfiniteQuery({
    queryKey: [cacheKeys.USER_CHATS, user?.id, courseId, search],
    queryFn: async ({ pageParam = 1 }): Promise<PaginatedChatResp> => {
      const resp = await appAxios.get(BackendRoutes.LIST_CHATS, {
        params: {
          q: search,
          page: pageParam,
          course_id: courseId,
        },
      });

      return resp.data;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.has_next ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!user?.id, // Only fetch when user is authenticated
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: false, // Disable automatic refetch, rely on WebSocket updates
    refetchOnWindowFocus: false, // Prevent refetch on window focus
  });

  return (
    <ChatProvider initialData={users_chats}>
      <CourseChatContent
        courseId={courseId}
        users_chats={users_chats}
        isLoadingChats={isLoadingChats}
        isFetchingChats={isFetchingChats}
        fetchChatsNextPage={fetchChatsNextPage}
        error={error}
        hasNextPage={hasNextPage}
        setActiveChat={setActiveChat}
        activeChat={activeChat}
        search={search}
        setSearch={setSearch}
        queryClient={queryClient}
        user={user}
      />
    </ChatProvider>
  );
};

export default CourseChat;
