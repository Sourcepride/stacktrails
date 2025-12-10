"use client";

import ChatLogsPanel from "@/components/chats/ChatLogsPanel";
import ChatMain from "@/components/chats/ChatMain";
import { ChatProvider } from "@/components/chats/context/ChatContext";
import appAxios from "@/lib/axiosClient";
import { cacheKeys } from "@/lib/cacheKeys";
import { BackendRoutes } from "@/routes";
import { useAppStore } from "@/store";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

type CourseChatProps = {
  courseId: string;
};

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
    </ChatProvider>
  );
};

export default CourseChat;
