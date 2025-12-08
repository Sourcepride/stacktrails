import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type MessageBubbleProps = {
  isCurrentUser: boolean;
  children: ReactNode;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};

export default function MessageBubble({
  isCurrentUser,
  children,
  onMouseEnter,
  onMouseLeave,
}: MessageBubbleProps) {
  return (
    <div
      className={cn(
        "px-4 py-2 rounded-lg relative group",
        isCurrentUser
          ? "bg-[#3e3d3d] text-white [&_*]:text-white [&_a]:text-blue-200 [&_a:hover]:text-white"
          : "bg-white border border-gray-200 text-gray-900"
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  );
}

