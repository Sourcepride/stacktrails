"use client";

import { InfiniteData } from "@tanstack/react-query";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type ChatContextType = {
  localChats: ChatAndUnReadCount[];
  setLocalChats: React.Dispatch<React.SetStateAction<ChatAndUnReadCount[]>>;
  updateChatStats: (chatId: string, stats: Partial<ChatStatRead>) => void;
  addNewChat: (chat: ChatRead) => void;
  updateChat: (chat: ChatRead) => void;
  removeChat: (chatId: string) => void;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

type ChatProviderProps = {
  children: ReactNode;
  initialData?: InfiniteData<PaginatedChatResp, unknown>;
};

export function ChatProvider({ children, initialData }: ChatProviderProps) {
  const [localChats, setLocalChats] = useState<ChatAndUnReadCount[]>([]);

  // Sync with initial/updated data from parent
  useEffect(() => {
    if (initialData?.pages) {
      const allChats = initialData.pages.flatMap((page) => page.items);
      setLocalChats(allChats);
      console.log("[ChatContext] Synced with initial data:", allChats.length);
    }
  }, [initialData]);

  // Update chat statistics (unread count, has_reply, etc.)
  // Memoized to prevent unnecessary re-renders
  const updateChatStats = useCallback(
    (chatId: string, stats: Partial<ChatStatRead>) => {
      console.log("[ChatContext] Updating chat stats:", { chatId, stats });
      setLocalChats((prev) =>
        prev.map((item) => {
          if (item.chat.id === chatId) {
            return {
              ...item,
              unread_count: stats.unread_count ?? item.unread_count,
              has_reply: stats.has_reply ?? item.has_reply,
            };
          }
          return item;
        })
      );
    },
    []
  );

  // Add a new chat to the top of the list
  // Memoized to prevent unnecessary re-renders
  const addNewChat = useCallback((chat: ChatRead) => {
    console.log("[ChatContext] Adding new chat:", chat.id);
    setLocalChats((prev) => [
      {
        chat,
        unread_count: 0,
        has_reply: false,
        last_message: null,
      },
      ...prev,
    ]);
  }, []);

  // Update an existing chat
  // Memoized to prevent unnecessary re-renders
  const updateChat = useCallback((updatedChat: ChatRead) => {
    console.log("[ChatContext] Updating chat:", updatedChat.id);
    setLocalChats((prev) =>
      prev.map((item) =>
        item.chat.id === updatedChat.id ? { ...item, chat: updatedChat } : item
      )
    );
  }, []);

  // Remove a chat from the list
  // Memoized to prevent unnecessary re-renders
  const removeChat = useCallback((chatId: string) => {
    console.log("[ChatContext] Removing chat:", chatId);
    setLocalChats((prev) => prev.filter((item) => item.chat.id !== chatId));
  }, []);

  const value: ChatContextType = {
    localChats,
    setLocalChats,
    updateChatStats,
    addNewChat,
    updateChat,
    removeChat,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

// Hook to use the chat context
export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}
