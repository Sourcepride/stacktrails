"use client";

import { Box, IconButton, Tab, Tabs } from "@mui/material";
import { IoChevronBack } from "@react-icons/all-files/io5/IoChevronBack";
import { IoChevronForward } from "@react-icons/all-files/io5/IoChevronForward";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import CourseChat from "../chats/CourseChat";
import CourseNav from "./layout/CourseNav";
import Comments from "./study-tabs/Comments";
import Review from "./study-tabs/Review";
import Summary from "./study-tabs/Summary";

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

type StudyTabsProps = {
  sections: FullSection[];
  progress?: CourseProgress;
  currentModule: FullModule;
  setCurrentModuleId: (id: string) => void;
  course: FullCourse;
  showContent?: boolean;
  showChats?: boolean;
  toggleCompleted: toggleCompletedType;
};
const StudyTabs: React.FC<StudyTabsProps> = ({
  sections,
  currentModule,
  setCurrentModuleId,
  progress,
  course,
  showContent,
  showChats,
  toggleCompleted,
}) => {
  const t = useTranslations();
  const [value, setValue] = useState("SUMMARY");
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showChats || showContent)
      setValue(showChats ? "CHATS" : "COURSE_ITEMS");
    else if (value === "COURSE_ITEMS" || value === "CHATS") setValue("SUMMARY");
  }, [showContent, showChats]);

  const NAV = useMemo(() => {
    const navItems: { key: string; title: string }[] = [
      { key: "SUMMARY", title: t("SUMMARY") },
      { key: "COMMENTS", title: t("COMMENTS") },
      { key: "REVIEWS", title: t("REVIEWS") },
    ];

    if (showContent) {
      navItems.unshift({ key: "COURSE_ITEMS", title: t("COURSE_ITEMS") });
    }

    if (showChats) {
      navItems.unshift({ key: "CHATS", title: t("CHATS") });
    }

    return navItems;
  }, [showContent, showChats]);

  const handleChange = (_: React.SyntheticEvent, newValue: any) => {
    setValue(newValue);
  };

  const checkScrollButtons = () => {
    const container = tabsContainerRef.current;
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      const canScrollLeftValue = scrollLeft > 5; // Small threshold for precision
      const canScrollRightValue = scrollLeft < scrollWidth - clientWidth - 5; // Small threshold for precision

      // console.log("Scroll check:", {
      //   scrollLeft,
      //   scrollWidth,
      //   clientWidth,
      //   canScrollLeftValue,
      //   canScrollRightValue,
      // });

      setCanScrollLeft(canScrollLeftValue);
      setCanScrollRight(canScrollRightValue);
    }
  };

  const scrollTabs = (direction: "left" | "right") => {
    const container = tabsContainerRef.current;
    if (container) {
      const scrollAmount = 200; // Adjust scroll distance as needed
      const newScrollLeft =
        direction === "left"
          ? container.scrollLeft - scrollAmount
          : container.scrollLeft + scrollAmount;

      container.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    // Check scroll buttons after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      checkScrollButtons();
    }, 100);

    const container = tabsContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollButtons);
      window.addEventListener("resize", checkScrollButtons);

      // Use ResizeObserver to detect when content changes
      const resizeObserver = new ResizeObserver(() => {
        setTimeout(checkScrollButtons, 50);
      });
      resizeObserver.observe(container);

      return () => {
        clearTimeout(timeoutId);
        container.removeEventListener("scroll", checkScrollButtons);
        window.removeEventListener("resize", checkScrollButtons);
        resizeObserver.disconnect();
      };
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [NAV, showContent, showChats]); // Re-check when NAV or visibility changes

  return (
    <div className="p-4 lg:px-8">
      <Box className="!relative">
        {/* Debug info */}
        {/* <div className="text-xs text-gray-500 mb-2">
          Left: {canScrollLeft ? "YES" : "NO"} | Right:{" "}
          {canScrollRight ? "YES" : "NO"} |
          <button
            onClick={checkScrollButtons}
            className="ml-2 px-2 py-1 bg-blue-200 rounded"
          >
            Check Scroll
          </button>
        </div> */}

        {/* Left scroll button - only visible on mobile when can scroll left */}
        {canScrollLeft && (
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-md">
            <IconButton
              onClick={() => scrollTabs("left")}
              sx={{
                width: 32,
                height: 32,
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
              }}
            >
              <IoChevronBack size={16} />
            </IconButton>
          </div>
        )}

        {/* Right scroll button - only visible on mobile when can scroll right */}
        {canScrollRight && (
          <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-md">
            <IconButton
              onClick={() => scrollTabs("right")}
              sx={{
                width: 32,
                height: 32,
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
              }}
            >
              <IoChevronForward size={16} />
            </IconButton>
          </div>
        )}

        <div ref={tabsContainerRef} className="overflow-x-auto scrollbar-hide">
          <Tabs
            value={value}
            onChange={handleChange}
            sx={{
              minWidth: "max-content",
              "& .MuiTab-root": {
                minWidth: "120px", // Ensure tabs are wide enough to cause overflow
                whiteSpace: "nowrap",
              },
            }}
          >
            {NAV.map(({ key, title }, index) => (
              <Tab
                label={title}
                key={key}
                value={key}
                sx={{ textTransform: "capitalize" }}
                {...a11yProps(index)}
              />
            ))}
          </Tabs>
        </div>
      </Box>
      <div className="lg:px-4">
        <div hidden={value !== "REVIEWS"} className="py-8">
          <Review courseId={course.id} />
        </div>
        <div hidden={value !== "COMMENTS"} className="py-8">
          <Comments courseId={course.id} />
        </div>
        <div hidden={value !== "CHATS"} className="">
          <CourseChat courseId={course.id} />
        </div>
        <div hidden={value !== "COURSE_ITEMS"} className="py-8">
          <CourseNav
            currentModule={currentModule}
            sections={sections}
            setCurrentModuleId={setCurrentModuleId}
            progress={progress}
            toggleCompleted={toggleCompleted}
          />
        </div>
        <div hidden={value !== "SUMMARY"} className="py-8">
          <Summary course={course} />
        </div>
      </div>
    </div>
  );
};

export default StudyTabs;
