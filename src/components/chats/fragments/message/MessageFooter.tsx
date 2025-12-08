import { cn } from "@/lib/utils";
import { FaEdit } from "@react-icons/all-files/fa/FaEdit";
import { formatChatTimestamp } from "./helpers";

type MessageFooterProps = {
  isEdited: boolean;
  createdAt?: string;
  isCurrentUser: boolean;
};

export default function MessageFooter({
  isEdited,
  createdAt,
  isCurrentUser,
}: MessageFooterProps) {
  if (!isCurrentUser) return null;

  return (
    <div className="flex items-center gap-2 mt-1 justify-end">
      {isEdited && (
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <FaEdit className="w-3 h-3" />
          Edited
        </span>
      )}
      {createdAt && (
        <span
          className={cn(
            "text-xs",
            isCurrentUser ? "text-gray-400" : "text-gray-500"
          )}
        >
          {formatChatTimestamp(createdAt)}
        </span>
      )}
    </div>
  );
}

