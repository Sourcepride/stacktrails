"use client";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  AccordionProps as MuiAccordionProps,
  Typography,
  useTheme,
} from "@mui/material";
import { MdKeyboardArrowDown } from "@react-icons/all-files/md/MdKeyboardArrowDown";

interface NavSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  color?: "primary" | "secondary" | "default";
  className?: string;
}

const NavSection: React.FC<NavSectionProps> = ({
  title,
  children,
  defaultExpanded = false,
  color = "secondary",
  className = "",
}) => {
  const ariaControlsId = `${title.replace(/\s+/g, "-").toLowerCase()}-content`;
  const ariaHeaderId = `${title.replace(/\s+/g, "-").toLowerCase()}-header`;

  return (
    <div className={`w-full ${className}`}>
      <CustomAccordion
        title={title}
        defaultExpanded={defaultExpanded}
        color={color}
        ariaControlsId={ariaControlsId}
        ariaHeaderId={ariaHeaderId}
      >
        {children}
      </CustomAccordion>
    </div>
  );
};

interface CustomAccordionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  color?: "primary" | "secondary" | "default";
  ariaControlsId?: string;
  ariaHeaderId?: string;
}

const CustomAccordion: React.FC<CustomAccordionProps> = ({
  title,
  children,
  defaultExpanded = false,
  color = "secondary",
  ariaControlsId,
  ariaHeaderId,
}) => {
  // Access your MUI theme
  const theme = useTheme();

  const getAccordionStyles = (): Partial<MuiAccordionProps["sx"]> => {
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
    };

    switch (color) {
      case "primary":
        return {
          ...baseStyles,
          backgroundColor: theme.palette.primary.light,
          "&:hover": {
            backgroundColor: "transparent",
          },
          "&.Mui-expanded": {
            backgroundColor: "transparent",
            margin: 0,
          },
        };
      case "default":
        return {
          ...baseStyles,
          backgroundColor: theme.palette.background.paper,
          "&:hover": {
            backgroundColor: "transparent",
          },
          "&.Mui-expanded": {
            backgroundColor: theme.palette.background.paper,
            margin: 0,
          },
        };
      case "secondary":
      default:
        return {
          ...baseStyles,
          backgroundColor: theme.palette.secondary.light,
          "&:hover": {
            backgroundColor: "transparent",
          },
          "&.Mui-expanded": {
            backgroundColor: "transparent",
            margin: 0,
          },
        };
    }
  };

  const getAccordionSummaryStyles = () => ({
    minHeight: 48,
    backgroundColor: theme.palette.grey[100],
    "&.Mui-expanded": {
      minHeight: 48,
    },
    "& .MuiAccordionSummary-content": {
      margin: "12px 0",
      "&.Mui-expanded": {
        margin: "12px 0",
      },
    },
  });

  return (
    <Accordion
      defaultExpanded={defaultExpanded}
      sx={getAccordionStyles() as any}
      disableGutters
    >
      <AccordionSummary
        expandIcon={
          <MdKeyboardArrowDown
            className="w-5 h-5"
            style={{ color: theme.palette.text.secondary }}
          />
        }
        aria-controls={ariaControlsId}
        id={ariaHeaderId}
        sx={getAccordionSummaryStyles()}
      >
        <Typography
          variant="h6"
          component="h3"
          sx={{
            fontWeight: "bold",
            textTransform: "capitalize",
            fontSize: "1rem",
          }}
        >
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails
        sx={{
          padding: 0,
          backgroundColor: "transparent",
        }}
      >
        {children}
      </AccordionDetails>
    </Accordion>
  );
};

export default NavSection;
