// ControlledAccordion.tsx
"use client";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  useTheme,
} from "@mui/material";
import { MdKeyboardArrowDown } from "@react-icons/all-files/md/MdKeyboardArrowDown";
import React from "react";

interface ControlledAccordionProps {
  children: React.ReactNode;
  expanded: boolean;
  onChange: (expanded: boolean) => void;
  headerContent?: React.ReactNode;
  showExpandIcon?: boolean;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  variant?: "default" | "minimal" | "bordered";
  disabled?: boolean;
  headerBackgroundColor?: string;
  contentBackgroundColor?: string;
  hoverColor?: string;
}

const ControlledAccordion: React.FC<ControlledAccordionProps> = ({
  children,
  expanded,
  onChange,
  headerContent,
  showExpandIcon = true,
  className = "",
  headerClassName = "",
  contentClassName = "",
  variant = "default",
  disabled = false,
  headerBackgroundColor = "transparent",
  contentBackgroundColor = "transparent",
  hoverColor = "transparent",
}) => {
  const theme = useTheme();

  const handleChange = () => {
    if (!disabled) {
      onChange(!expanded);
    }
  };

  const getAccordionStyles = () => {
    const baseStyles = {
      width: "100%",
      boxShadow: "none",
      backgroundColor: "transparent",
      border: "none",
      "&:before": {
        display: "none",
      },
      "&.Mui-expanded": {
        margin: 0,
        backgroundColor: "transparent",
      },
      "&:hover": {
        backgroundColor: "transparent",
      },
      "& .MuiButtonBase-root": {
        ...(!headerContent && { display: "none" }),
      },
    };

    switch (variant) {
      case "minimal":
        return {
          ...baseStyles,
          backgroundColor: "transparent",
        };
      case "bordered":
        return {
          ...baseStyles,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: theme.shape.borderRadius,
          backgroundColor: "transparent",
        };
      case "default":
      default:
        return {
          ...baseStyles,
          backgroundColor: "transparent",
        };
    }
  };

  const getSummaryStyles = () => ({
    minHeight: headerContent ? 48 : 0,
    padding: headerContent ? theme.spacing(0, 2) : 0,
    cursor: disabled ? "default" : "pointer",
    backgroundColor: headerBackgroundColor,
    "&:hover": {
      backgroundColor: disabled ? "transparent" : hoverColor,
    },
    "&.Mui-expanded": {
      minHeight: headerContent ? 48 : 0,
      backgroundColor: headerBackgroundColor,
    },
    "& .MuiAccordionSummary-content": {
      margin: headerContent ? "12px 0" : 0,
      "&.Mui-expanded": {
        margin: headerContent ? "12px 0" : 0,
      },
    },
    "& .MuiAccordionSummary-expandIconWrapper": {
      color: disabled
        ? theme.palette.action.disabled
        : theme.palette.text.secondary,
    },
  });

  return (
    <div className={`w-full ${className}`}>
      <Accordion
        expanded={expanded}
        onChange={handleChange}
        disabled={disabled}
        sx={getAccordionStyles()}
      >
        {(headerContent || showExpandIcon) && (
          <AccordionSummary
            expandIcon={
              showExpandIcon ? (
                <MdKeyboardArrowDown
                  className="w-5 h-5 transition-transform duration-200"
                  style={{
                    color: disabled
                      ? theme.palette.action.disabled
                      : theme.palette.text.secondary,
                    transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              ) : null
            }
            className={headerClassName}
            sx={getSummaryStyles()}
          >
            {headerContent}
          </AccordionSummary>
        )}
        <AccordionDetails
          className={contentClassName}
          sx={{
            padding: theme.spacing(2),
            backgroundColor: contentBackgroundColor,
            paddingTop: headerContent ? theme.spacing(2) : theme.spacing(1),
          }}
        >
          {children}
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

// Example usage component
const AccordionExample: React.FC = () => {
  const [expanded1, setExpanded1] = React.useState(false);
  const [expanded2, setExpanded2] = React.useState(false);
  const [expanded3, setExpanded3] = React.useState(true);

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-2xl font-bold mb-4">Controlled Accordion Examples</h2>

      {/* Accordion with custom colors */}
      <ControlledAccordion
        expanded={expanded1}
        onChange={setExpanded1}
        headerContent={
          <div className="flex items-center justify-between w-full">
            <span className="font-semibold">Custom Colors</span>
            <span className="text-sm text-gray-500">
              With background colors
            </span>
          </div>
        }
        variant="bordered"
        headerBackgroundColor="#f0f9ff"
        contentBackgroundColor="#fef3c7"
        hoverColor="#dbeafe"
      >
        <p>This accordion has custom header and content background colors.</p>
        <p>Header is light blue, content is light yellow, hover is blue.</p>
      </ControlledAccordion>

      {/* Fully transparent accordion */}
      <ControlledAccordion
        expanded={expanded2}
        onChange={setExpanded2}
        variant="minimal"
      >
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded">
          <h3 className="font-bold text-purple-800">Fully Transparent</h3>
          <p>
            This accordion is completely transparent - no background colors at
            all.
          </p>
          <p>
            The gradient background you see is from the content inside, not the
            accordion.
          </p>
        </div>
      </ControlledAccordion>

      {/* Accordion with only header color */}
      <ControlledAccordion
        expanded={expanded3}
        onChange={setExpanded3}
        headerContent={
          <span className="font-semibold text-green-700">
            Header Color Only
          </span>
        }
        showExpandIcon={false}
        variant="default"
        headerBackgroundColor="#dcfce7"
        hoverColor="#bbf7d0"
      >
        <p>This accordion has a colored header but transparent content area.</p>
        <p>
          Useful when you want to highlight the header but keep content area
          clean.
        </p>
      </ControlledAccordion>

      {/* Control buttons */}
      <div className="flex gap-2 mt-6">
        <button
          onClick={() => setExpanded1(!expanded1)}
          className="px-4 py-2 bg-gray-600 text-white rounded"
        >
          Toggle First
        </button>
        <button
          onClick={() => setExpanded2(!expanded2)}
          className="px-4 py-2 bg-gray-600 text-white rounded"
        >
          Toggle Second
        </button>
        <button
          onClick={() => setExpanded3(!expanded3)}
          className="px-4 py-2 bg-gray-600 text-white rounded"
        >
          Toggle Third
        </button>
        <button
          onClick={() => {
            setExpanded1(false);
            setExpanded2(false);
            setExpanded3(false);
          }}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Collapse All
        </button>
      </div>
    </div>
  );
};

export { AccordionExample, ControlledAccordion };
export default ControlledAccordion;
