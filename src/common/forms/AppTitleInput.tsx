"use client";
import { ComponentPropsWithoutRef, useEffect, useRef } from "react";
import ErrorMessage from "./ErrorMessage";

type AppTitleInputProps = {
  isLoading?: boolean;
  hookFormProps: {};
  errorMessage?: string;
} & ComponentPropsWithoutRef<"textarea">;

const AppTitleInput: React.FC<AppTitleInputProps> = ({
  hookFormProps,
  errorMessage,
  isLoading,
  ...props
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = "auto";

      // Set height based on scrollHeight, with a minimum of one row
      const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight);
      const minHeight = lineHeight || 24; // fallback line height
      const newHeight = Math.max(textarea.scrollHeight, minHeight);

      textarea.style.height = `${newHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [props.value]);

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    adjustHeight();
    if (props.onInput) {
      props.onInput(e);
    }
  };

  return (
    <div className="">
      <textarea
        {...hookFormProps} // register first
        {...props} // your custom props after
        ref={(el) => {
          textareaRef.current = el;
          if (typeof (hookFormProps as any)?.ref === "function") {
            (hookFormProps as any).ref(el);
          } else if ((hookFormProps as any)?.ref) {
            (hookFormProps as any).ref.current = el;
          }
        }}
        className={`text-2xl font-black w-full px-3 outline-0 placeholder:text-appGray400 xl:text-4xl resize-none overflow-hidden ${props.className}`}
        disabled={isLoading || props.disabled}
        placeholder={props.placeholder || "Title"}
        maxLength={200}
        onInput={handleInput}
        style={{
          minHeight: "1.5em",
          ...props.style,
        }}
      />

      <ErrorMessage message={errorMessage} />
    </div>
  );
};

export default AppTitleInput;
