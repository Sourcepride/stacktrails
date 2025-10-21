import { FiCopy } from "@react-icons/all-files/fi/FiCopy";
import { FiCpu } from "@react-icons/all-files/fi/FiCpu";
import { FiEdit3 } from "@react-icons/all-files/fi/FiEdit3";
import * as pdfjsLib from "pdfjs-dist";
import React, { useEffect, useRef } from "react";
// Define the type for the selection options
type selectOptionsT = "copy" | "note" | "ai";

type PdfSelectOptionsProps = {
  coord: { x: number; y: number };
  onClose: () => void;
  onSelect: (t: selectOptionsT) => void;
  viewPort: pdfjsLib.PageViewport;
};

const PdfSelectOptions: React.FC<PdfSelectOptionsProps> = ({
  coord,
  onClose,
  onSelect,
  viewPort,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Add an effect to handle clicks outside the menu to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    // Add event listener when the component mounts
    document.addEventListener("mousedown", handleClickOutside);
    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // A simple, reusable component for menu items
  const CustomMenuItem = ({
    icon,
    label,
    action,
  }: {
    icon: React.ReactNode;
    label: string;
    action: selectOptionsT;
  }) => (
    <div
      // Use onMouseDown to ensure the action fires before the menu closes
      onMouseDown={() => onSelect(action)}
      className="gap-2 flex items-center px-3 py-2 hover:bg-gray-800 cursor-pointer"
    >
      {icon}
      <p className="m-0 text-sm">{label}</p>
    </div>
  );
  const hozThresh = Math.max(coord.x, viewPort.width);

  return (
    <div
      ref={menuRef}
      style={{
        // Use 'absolute' to position relative to the nearest positioned ancestor
        position: "absolute",
        top: `${Math.round(coord.y)}px`,
        left: `${
          coord.x + 180 > hozThresh
            ? Math.round(coord.x - 180)
            : Math.round(coord.x)
        }px`,
        // Replicating your original styles
        backgroundColor: "#000",
        width: 180,
        color: "#fff",
        borderRadius: 8,
        zIndex: 1300, // Ensure it appears above other content
      }}
    >
      <CustomMenuItem
        action="copy"
        icon={<FiCopy className="w-4 h-4" />}
        label="Copy"
      />
      <CustomMenuItem
        action="note"
        icon={<FiEdit3 className="w-4 h-4" />}
        label="Add Note"
      />
      <CustomMenuItem
        action="ai"
        icon={<FiCpu className="w-4 h-4" />}
        label="AI Assistant"
      />
    </div>
  );
};

export default PdfSelectOptions;
