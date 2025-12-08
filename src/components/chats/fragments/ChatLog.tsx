/*
    represents a single chat with a group or a person 
    when clicked on open the chat details (chat messages)

    UI
    -  should have a good profile image at the side
    -  should have the name of group or user
    -  should have the last message sent 
    - indicator if the chat has newer unread messages 
    -  indicator if the user has been mentioned in the chat

    Future Feature
    -  can be pinned or grouped
    - can indicate when some is typing
*/

import { timeAgo } from "@/lib/utils";
import { Avatar } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { FaAt } from "@react-icons/all-files/fa/FaAt";
import { useState } from "react";

type ChatLogProps = {
  data: ChatRead;
  unreadCount?: number;
  hasReply?: boolean;
  isActive?: boolean;
  lastMessage?: string;
  onClick?: () => void;
};

export default function ChatLog({
  data,
  unreadCount = 0,
  hasReply = false,
  isActive = false,
  lastMessage,
  onClick,
}: ChatLogProps) {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  // Get chat name: group name or user's username
  const chatName =
    data.name ||
    data.account?.username ||
    data.account?.profile?.display_name ||
    "Unknown";

  // Get avatar: chat avatar_url or user's profile avatar
  const avatarUrl = data.avatar_url || data.account?.profile?.avatar;

  // Get initials for avatar fallback
  const getInitials = (name: string): string => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(chatName);

  // Determine if should show highlight
  const shouldHighlight = isActive || isHovered;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors duration-150 ${
        shouldHighlight ? "bg-primary/10" : "hover:bg-primary/5"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <Avatar
          src={avatarUrl || undefined}
          alt={chatName}
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: "black",
            fontSize: "1rem",
            fontWeight: 600,
          }}
        >
          {initials}
        </Avatar>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        {/* Header: Name and Time */}
        <div className="flex items-center justify-between gap-2">
          <h6 className="text-sm font-medium capitalize text-gray-900 truncate flex-shrink">
            {chatName}
          </h6>
          <div className="flex-shrink-0 text-xs text-gray-500 whitespace-nowrap">
            {timeAgo(data.last_message_at)}
          </div>
        </div>

        {/* Footer: Last Message and Indicators */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-gray-500 truncate flex-1 min-w-0">
            {lastMessage || "No messages yet"}
          </p>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Reply/Mention indicator */}
            {hasReply && (
              <div className="flex items-center justify-center w-5 h-5 text-primary">
                <FaAt className="w-3 h-3" />
              </div>
            )}
            {/* Unread count badge */}
            {unreadCount > 0 && (
              <div
                className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: theme.palette.primary.main }}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
