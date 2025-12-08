import { formatChatTimestamp } from "./helpers";

type MessageHeaderProps = {
  senderName: string;
  isCreator?: boolean;
  createdAt?: string;
};

export default function MessageHeader({
  senderName,
  isCreator,
  createdAt,
}: MessageHeaderProps) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <span className="text-xs font-medium text-gray-700">
        {isCreator ? "you" : senderName}
      </span>
      {!isCreator && createdAt && (
        <span className="text-xs text-gray-500">
          {formatChatTimestamp(createdAt)}
        </span>
      )}
    </div>
  );
}
