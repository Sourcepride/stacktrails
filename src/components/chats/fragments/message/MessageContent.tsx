import MarkdownRenderer from "@/common/markdown/AppMdRenderer";
import EditMessageForm from "./EditMessageForm";
import FileAttachment from "./FileAttachment";
import ImageAttachment from "./ImageAttachment";

type MessageContentProps = {
  message: ChatMessageRead;
  isCurrentUser: boolean;
  isEditing: boolean;
  editContent: string;
  onEditContentChange: (content: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
};

export default function MessageContent({
  message,
  isCurrentUser,
  isEditing,
  editContent,
  onEditContentChange,
  onSaveEdit,
  onCancelEdit,
}: MessageContentProps) {
  switch (message.message_type) {
    case "text":
      if (!message.content) return null;

      // Show edit input when editing
      if (isEditing && isCurrentUser) {
        return (
          <EditMessageForm
            content={editContent}
            onChange={onEditContentChange}
            onSave={onSaveEdit}
            onCancel={onCancelEdit}
          />
        );
      }

      return (
        <div className="text-gray-900 whitespace-pre-wrap break-words">
          <MarkdownRenderer content={message.content} />
        </div>
      );

    case "image":
      return (
        <ImageAttachment
          imageUrl={message.file_url}
          fileName={message.file_name}
          caption={message.content}
        />
      );

    case "file":
      return (
        <FileAttachment
          fileUrl={message.file_url}
          fileName={message.file_name}
          fileSize={message.file_size}
          caption={message.content}
        />
      );

    case "system":
      return (
        <div className="text-center text-gray-500 text-sm italic">
          {message.content || "System message"}
        </div>
      );

    default:
      return (
        <div className="text-gray-900 whitespace-pre-wrap break-words">
          {message.content || "Message"}
        </div>
      );
  }
}

