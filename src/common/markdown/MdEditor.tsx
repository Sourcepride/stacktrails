"use client";

import MarkdownIt from "markdown-it";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";

const mdParser = new MarkdownIt(/* Markdown-it options */);

export default function EditorLite({
  changeHandler,
  text,
  style,
}: {
  text: string;
  changeHandler: (text: string) => void;
  style?: React.CSSProperties;
}) {
  return (
    <MdEditor
      style={{ height: "500px", ...style }}
      value={text}
      renderHTML={(text_) => mdParser.render(text_)}
      onChange={({ text: text_ }) => {
        changeHandler(text_);
      }}
      view={{ menu: true, md: true, html: false }}
      // Prevent image upload
      onImageUpload={() => {
        return Promise.reject("Image upload is disabled");
      }}
      // Optional: Remove image upload button from toolbar
      plugins={[
        "header",
        "font-bold",
        "font-italic",
        "font-underline",
        "font-strikethrough",
        "list-unordered",
        "list-ordered",
        "block-quote",
        "block-wrap",
        "block-code-inline",
        "block-code-block",
        "table",
        "link",
        "clear",
        "logger",
        "mode-toggle",
        "full-screen",
        "tab-insert",
        // Note: 'image' plugin is excluded to remove upload button
      ]}
    />
  );
}
