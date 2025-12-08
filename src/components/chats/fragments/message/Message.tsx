"use client";

import ConfirmPopup from "@/common/popups/ComfirmPop";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store";
import { IoTrashBin } from "@react-icons/all-files/io5/IoTrashBin";
import { useTranslations } from "next-intl";
import { useState } from "react";
import CourseModuleReference from "./CourseModuleReference";
import DeletedMessage from "./DeletedMessage";
import MessageActions from "./MessageActions";
import MessageBubble from "./MessageBubble";
import MessageContent from "./MessageContent";
import MessageFooter from "./MessageFooter";
import MessageHeader from "./MessageHeader";
import SenderAvatar from "./SenderAvatar";
import { getInitials } from "./helpers";

type MessageProps = {
  message: ChatMessageRead;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
};

export default function Message({ message, onEdit, onDelete }: MessageProps) {
  const { user } = useAppStore((state) => state);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content || "");
  const [showActions, setShowActions] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const t = useTranslations();

  // Determine if message is from current user
  const isCurrentUser = message.sender?.account_id === user?.id;

  // Get sender info
  const senderName =
    message.sender?.account?.profile?.display_name ||
    message.sender?.account?.username ||
    "Unknown";
  const senderAvatar =
    message.sender?.account?.profile?.avatar ||
    message.chat?.avatar_url ||
    undefined;

  const initials = getInitials(senderName);

  // Handle edit save
  const handleSaveEdit = () => {
    if (editContent.trim() && onEdit && editContent !== message.content) {
      onEdit(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  // Handle edit cancel
  const handleCancelEdit = () => {
    setEditContent(message.content || "");
    setIsEditing(false);
  };

  // Handle delete
  const handleDelete = () => {
    setShowDelete(true);
  };

  // Handle deleted messages
  if (message.is_deleted) {
    return (
      <DeletedMessage
        isCurrentUser={isCurrentUser}
        senderAvatar={senderAvatar}
        senderName={senderName}
        initials={initials}
      />
    );
  }

  // Check for course module reference in extra_data
  const courseModuleRef = message.extra_data?.course_module;
  const courseRef = message.chat?.course;

  // System messages have special layout (centered, no bubble)
  if (message.message_type === "system") {
    return (
      <div className="w-full flex justify-center mb-4">
        <div className="w-[80%]">
          <MessageContent
            message={message}
            isCurrentUser={isCurrentUser}
            isEditing={false}
            editContent=""
            onEditContentChange={() => {}}
            onSaveEdit={() => {}}
            onCancelEdit={() => {}}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-full flex mb-4",
        isCurrentUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "w-[80%] flex gap-2",
          isCurrentUser && "flex-row-reverse"
        )}
      >
        {/* Avatar - only show for other users */}
        {!isCurrentUser && (
          <SenderAvatar
            avatarUrl={senderAvatar}
            name={senderName}
            initials={initials}
          />
        )}

        {/* Message Content */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Sender name and timestamp - only for other users */}

          <MessageHeader
            isCreator={isCurrentUser}
            senderName={senderName}
            createdAt={message.created_at}
          />

          {/* Course Module Reference */}
          {courseModuleRef && courseRef && (
            <CourseModuleReference
              courseTitle={courseRef.title}
              moduleTitle={courseModuleRef.title}
            />
          )}
          {/* Message Bubble */}
          <MessageBubble
            isCurrentUser={isCurrentUser}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
          >
            <MessageContent
              message={message}
              isCurrentUser={isCurrentUser}
              isEditing={isEditing}
              editContent={editContent}
              onEditContentChange={setEditContent}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={handleCancelEdit}
            />

            {/* Edit/Delete Actions - Only show for current user's text messages */}
            {isCurrentUser && message.message_type === "text" && !isEditing && (
              <MessageActions
                onEdit={() => setIsEditing(true)}
                onDelete={handleDelete}
                show={showActions}
              />
            )}
          </MessageBubble>
          {/* Edited indicator and timestamp for current user */}
          <MessageFooter
            isEdited={message.is_edited}
            createdAt={message.created_at}
            isCurrentUser={isCurrentUser}
          />

          {showDelete && (
            <ConfirmPopup
              body={t("CHAT.DELETE_MESSAGE")}
              header={t("CONFIRM_DELETE")}
              close={() => setShowDelete(false)}
              isOpen={showDelete}
              proceedCallback={() => {
                onDelete?.(message.id);
                setShowDelete(false);
              }}
              cancelText={t("CANCEL_TEXT")}
              proceedText={t("PROCEED_DELETE")}
              icon={<IoTrashBin />}
            />
          )}
        </div>
      </div>
    </div>
  );
}
