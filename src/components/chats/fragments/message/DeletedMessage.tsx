import { cn } from "@/lib/utils";
import { Avatar } from "@mui/material";

type DeletedMessageProps = {
  isCurrentUser: boolean;
  senderAvatar?: string;
  senderName: string;
  initials: string;
};

export default function DeletedMessage({
  isCurrentUser,
  senderAvatar,
  senderName,
  initials,
}: DeletedMessageProps) {
  return (
    <div
      className={cn(
        "w-full flex",
        isCurrentUser ? "justify-end" : "justify-start"
      )}
    >
      <div className="w-[80%] flex gap-2">
        {!isCurrentUser && (
          <div className="flex-shrink-0">
            <Avatar
              src={senderAvatar || undefined}
              alt={senderName}
              sx={{
                width: 32,
                height: 32,
                borderRadius: "100%",
                bgcolor: "black",
                fontSize: "0.75rem",
                fontWeight: 600,
              }}
            >
              {initials}
            </Avatar>
          </div>
        )}
        <div className="flex-1 px-4 py-2 rounded-lg bg-gray-100 text-gray-500 italic text-sm">
          This message was deleted
        </div>
      </div>
    </div>
  );
}

