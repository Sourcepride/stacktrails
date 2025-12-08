"use client";

import { IconButton } from "@mui/material";
import { FaMicrophone } from "@react-icons/all-files/fa/FaMicrophone";
import { FaPaperPlane } from "@react-icons/all-files/fa/FaPaperPlane";
import { FaPaperclip } from "@react-icons/all-files/fa/FaPaperclip";
import { useEffect, useRef, useState } from "react";

type ChatInputBoxProps = {
  onSend?: (message: string) => void;
  onAttach?: () => void;
  onVoiceRecord?: () => void;
  placeholder?: string;
  disabled?: boolean;
};

export default function ChatInputBox({
  onSend,
  onAttach,
  onVoiceRecord,
  placeholder = "Your message",
  disabled = false,
}: ChatInputBoxProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight);
      const minHeight = lineHeight || 24;
      const maxHeight = lineHeight * 6; // Max 6 lines
      const newHeight = Math.min(
        Math.max(textarea.scrollHeight, minHeight),
        maxHeight
      );
      textarea.style.height = `${newHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [message]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    adjustHeight();
  };

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend?.(message.trim());
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasMessage = message.trim().length > 0;

  return (
    <div className="border-t  border-gray-200 bg-white px-1 py-3">
      <div className="flex relative items-center gap-2">
        {/* Attachment Button */}
        <IconButton
          onClick={onAttach}
          disabled={disabled}
          className="!absolute top-1/2 -translate-y-1/2 !flex-shrink-0 !text-gray-600 hover:!text-gray-900 hover:!bg-gray-100 "
          aria-label="Attach file"
        >
          <FaPaperclip className="w-4.5 h-4.5" />
        </IconButton>

        {/* Text Input Area */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full px-4 pl-8 py-2.5 bg-primary/10 border border-gray-300 rounded-lg resize-none overflow-y-auto focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            style={{
              minHeight: "44px",
              maxHeight: "150px",
            }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Microphone Button - Show when no message */}
          {!hasMessage && (
            <IconButton
              onClick={onVoiceRecord}
              disabled={disabled}
              className=" !text-gray-600 hover:!text-gray-900 hover:!bg-gray-100"
              aria-label="Record voice message"
            >
              <FaMicrophone className="w-5 h-5" />
            </IconButton>
          )}

          {/* Send Button - Show when there's a message */}
          {hasMessage && (
            <IconButton
              onClick={handleSend}
              disabled={disabled || !hasMessage}
              className="!bg-primary !text-white hover:!bg-primary/90 disabled:!bg-gray-300 disabled:!text-gray-500"
              aria-label="Send message"
            >
              <FaPaperPlane className="w-5 h-5" />
            </IconButton>
          )}
        </div>
      </div>
    </div>
  );
}
