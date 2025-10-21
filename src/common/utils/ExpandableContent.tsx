// ExpandableContent.tsx
"use client";
import { useTheme } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";

interface ExpandableContentProps {
  children: React.ReactNode;
  maxHeight?: number; // in pixels
  maxLines?: number; // alternative to maxHeight
  lineHeight?: number; // explicit line height in pixels (e.g., 24)
  maxCharacters?: number; // for text truncation
  expandText?: string;
  collapseText?: string;
  showGradient?: boolean;
  gradientColor?: string;
  buttonPosition?: "center" | "left" | "right";
  buttonClassName?: string;
  containerClassName?: string;
  controlled?: boolean;
  expanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  animationDuration?: number;
}

const ExpandableContent: React.FC<ExpandableContentProps> = ({
  children,
  maxHeight = 100,
  maxLines,
  lineHeight = 24, // default line height
  maxCharacters,
  expandText = "Show more",
  collapseText = "Show less",
  showGradient = true,
  gradientColor,
  buttonPosition = "center",
  buttonClassName = "",
  containerClassName = "",
  controlled = false,
  expanded: controlledExpanded,
  onToggle,
  animationDuration = 300,
}) => {
  const theme = useTheme();
  const contentRef = useRef<HTMLDivElement>(null);
  const [internalExpanded, setInternalExpanded] = useState(false);
  const [needsExpansion, setNeedsExpansion] = useState(false);
  const [fullContentHeight, setFullContentHeight] = useState<number>(0);
  const [calculatedMaxHeight, setCalculatedMaxHeight] =
    useState<number>(maxHeight);

  const expanded = controlled ? controlledExpanded ?? false : internalExpanded;

  useEffect(() => {
    const contentElement = contentRef.current;
    if (!contentElement) return;

    // Calculate the collapsed height based on props
    let collapsedHeight = maxHeight;
    if (maxLines) {
      collapsedHeight = lineHeight * maxLines;
    }
    setCalculatedMaxHeight(collapsedHeight);

    // Use ResizeObserver to detect when the content's size changes.
    // This correctly handles asynchronously rendered content like Markdown.
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Use scrollHeight to get the full height of the content, even when overflowing
        const naturalHeight = entry.target.scrollHeight;

        setFullContentHeight(naturalHeight);

        // Determine if expansion is needed based on the final, measured height
        if (maxCharacters) {
          const textContent = entry.target.textContent || "";
          setNeedsExpansion(textContent.length > maxCharacters);
        } else {
          setNeedsExpansion(naturalHeight > collapsedHeight);
        }
      }
    });

    observer.observe(contentElement);

    // Cleanup: disconnect the observer when the component unmounts
    return () => observer.disconnect();
  }, [children, maxHeight, maxLines, lineHeight, maxCharacters]);

  const handleToggle = () => {
    if (controlled && onToggle) {
      onToggle(!expanded);
    } else {
      setInternalExpanded(!expanded);
    }
  };

  const getTruncatedContent = () => {
    // Character-based truncation is handled differently from height-based
    if (!maxCharacters || expanded) return children;

    const textContent =
      typeof children === "string"
        ? children
        : contentRef.current?.textContent || "";

    if (textContent.length <= maxCharacters) return children;

    return textContent.slice(0, maxCharacters) + "...";
  };

  const buttonPositionClass = {
    center: "text-center",
    left: "text-left",
    right: "text-right",
  }[buttonPosition];

  const defaultGradient = gradientColor || theme.palette.background.default;

  // If the content doesn't need expansion, just render it directly.
  // We check fullContentHeight > 0 to avoid a flash of the collapsed state on initial render.
  if (!needsExpansion && fullContentHeight > 0) {
    return <div className={containerClassName}>{children}</div>;
  }

  return (
    <div className={`relative w-full ${containerClassName}`}>
      {/* Content Container */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out w-full relative"
        style={{
          maxHeight: expanded
            ? `${fullContentHeight}px`
            : `${calculatedMaxHeight}px`,
          transitionDuration: `${animationDuration}ms`,
        }}
      >
        {/* The ref is now on the direct child that contains the content */}
        <div ref={contentRef} className="w-full">
          {getTruncatedContent()}
        </div>

        {/* Gradient Overlay */}
        {showGradient && !expanded && (
          <div
            className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
            style={{
              background: `linear-gradient(to bottom, transparent, ${defaultGradient})`,
            }}
          />
        )}
      </div>

      {/* Expand/Collapse Button - Only show if needed */}
      {needsExpansion && (
        <div className={`mt-2 w-full ${buttonPositionClass}`}>
          <button
            onClick={handleToggle}
            className={`
              px-3 py-1 text-sm font-medium rounded transition-colors duration-200
              hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
              ${buttonClassName}
            `}
            style={{
              color: theme.palette.primary.main,
              backgroundColor: "transparent",
            }}
          >
            {expanded ? collapseText : expandText}
          </button>
        </div>
      )}
    </div>
  );
};

// Text-specific expandable component (Unchanged)
interface ExpandableTextProps {
  text: string;
  maxCharacters?: number;
  maxWords?: number;
  expandText?: string;
  collapseText?: string;
  className?: string;
}

const ExpandableText: React.FC<ExpandableTextProps> = ({
  text,
  maxCharacters = 150,
  maxWords,
  expandText = "Read more",
  collapseText = "Read less",
  className = "",
}) => {
  const [expanded, setExpanded] = useState(false);

  const getTruncatedText = () => {
    if (maxWords) {
      const words = text.split(" ");
      return words.length > maxWords
        ? words.slice(0, maxWords).join(" ") + "..."
        : text;
    }
    return text.length > maxCharacters
      ? text.slice(0, maxCharacters) + "..."
      : text;
  };

  const needsTruncation = maxWords
    ? text.split(" ").length > maxWords
    : text.length > maxCharacters;

  if (!needsTruncation) {
    return <p className={`w-full ${className}`}>{text}</p>;
  }

  return (
    <div className={`w-full ${className}`}>
      <p>
        {expanded ? text : getTruncatedText()}{" "}
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-blue-600 hover:text-blue-800 font-medium underline cursor-pointer"
        >
          {expanded ? collapseText : expandText}
        </button>
      </p>
    </div>
  );
};

// Example usage component (Unchanged)
const ExpandableContentExample: React.FC = () => {
  const [controlled1, setControlled1] = useState(false);

  const longText =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.";

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 p-6">
      <h2 className="text-2xl font-bold mb-6">Expandable Content Examples</h2>

      {/* Height-based expansion */}
      <div className="w-full border rounded-lg p-4">
        <h3 className="font-semibold mb-3">
          Height-Based Expansion (100px max)
        </h3>
        <ExpandableContent maxHeight={100}>
          <div className="space-y-2">
            <p>
              This is a long content that will be truncated based on height.
            </p>
            <p>{longText}</p>
            <p>More content here that goes beyond the height limit.</p>
            <ul className="list-disc list-inside">
              <li>List item 1</li>
              <li>List item 2</li>
              <li>List item 3</li>
            </ul>
          </div>
        </ExpandableContent>
      </div>

      {/* Line-based expansion */}
      <div className="w-full border rounded-lg p-4">
        <h3 className="font-semibold mb-3">
          Line-Based Expansion (3 lines max, 24px line height)
        </h3>
        <ExpandableContent maxLines={3} lineHeight={24} showGradient={true}>
          <p className="leading-6 m-0">
            This content will be limited to exactly 3 lines of text with 24px
            line height. {longText} This continues beyond what should be visible
            initially. You can see how it creates a nice fade effect with the
            gradient overlay. This should definitely be more than 3 lines when
            displayed at full width.
          </p>
        </ExpandableContent>
      </div>

      {/* Line-based with different line height */}
      <div className="w-full border rounded-lg p-4">
        <h3 className="font-semibold mb-3">
          Line-Based Expansion (2 lines max, 32px line height)
        </h3>
        <ExpandableContent maxLines={2} lineHeight={32} showGradient={true}>
          <p className="text-lg leading-8 m-0">
            This content has larger text with 32px line height and will be
            limited to exactly 2 lines. {longText} This should be truncated
            after 2 lines.
          </p>
        </ExpandableContent>
      </div>

      {/* Character-based expansion */}
      <div className="w-full border rounded-lg p-4">
        <h3 className="font-semibold mb-3">
          Character-Based Expansion (200 chars)
        </h3>
        <ExpandableContent maxCharacters={200} showGradient={false}>
          <p>{longText}</p>
        </ExpandableContent>
      </div>

      {/* Controlled expansion */}
      <div className="w-full border rounded-lg p-4">
        <h3 className="font-semibold mb-3">
          Controlled Expansion (80px max height)
        </h3>
        <ExpandableContent
          maxHeight={80}
          controlled={true}
          expanded={controlled1}
          onToggle={setControlled1}
          expandText="Expand Content"
          collapseText="Collapse Content"
          buttonPosition="right"
        >
          <div className="bg-blue-50 p-3 rounded w-full">
            <p>
              This is controlled externally with 80px max height. {longText}
            </p>
          </div>
        </ExpandableContent>
        <button
          onClick={() => setControlled1(!controlled1)}
          className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm"
        >
          External Toggle ({controlled1 ? "Collapse" : "Expand"})
        </button>
      </div>

      {/* Simple text expansion */}
      <div className="w-full border rounded-lg p-4">
        <h3 className="font-semibold mb-3">
          Simple Text Expansion (20 words max)
        </h3>
        <ExpandableText
          text={longText}
          maxWords={20}
          className="text-gray-700"
        />
      </div>

      {/* Custom styling */}
      <div className="w-full border rounded-lg p-4 bg-gradient-to-br from-purple-50 to-pink-50">
        <h3 className="font-semibold mb-3">Custom Styled (60px max height)</h3>
        <ExpandableContent
          maxHeight={60}
          expandText="🔽 Show more"
          collapseText="🔼 Show less"
          buttonPosition="center"
          showGradient={true}
          gradientColor="#fdf2f8"
          buttonClassName="bg-purple-100 hover:bg-purple-200 text-purple-800 px-4 py-2 rounded-full"
        >
          <div className="text-purple-900 w-full">
            <p className="font-medium">Custom styled expandable content!</p>
            <p>{longText}</p>
          </div>
        </ExpandableContent>
      </div>
    </div>
  );
};

export { ExpandableContent, ExpandableContentExample, ExpandableText };
export default ExpandableContent;
