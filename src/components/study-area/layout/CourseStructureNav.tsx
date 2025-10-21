"use client";

import CourseChat from "@/components/chats/CourseChat";
import { Tab, Tabs } from "@mui/material";
import { IoClose } from "@react-icons/all-files/io5/IoClose";
import { IoExpand } from "@react-icons/all-files/io5/IoExpand";
import { useTranslations } from "next-intl";
import { useState } from "react";
import CourseNav from "./CourseNav";

type CourseStructureNavProps = {
  sections: FullSection[];
  progress?: CourseProgress;
  currentModule: FullModule;
  setCurrentModuleId: (id: string) => void;
  onClose: () => void;
  toggleCompleted: toggleCompletedType;
};

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const CourseStructureNav: React.FC<CourseStructureNavProps> = ({
  sections,
  currentModule,
  setCurrentModuleId,
  progress,
  onClose,
  toggleCompleted,
}) => {
  const t = useTranslations();
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <div className="relative">
      <div className="sticky flex items-center gap-4  top-0 left-0 h-12 w-full bg-white py-2 px-4 z-10">
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
        >
          <Tab
            label={t("COURSE_ITEMS")}
            sx={{ textTransform: "capitalize" }}
            {...a11yProps(0)}
          />
          <Tab
            label={t("CHATS")}
            sx={{ textTransform: "capitalize" }}
            {...a11yProps(1)}
          />
        </Tabs>

        <button type="button" className="ml-auto cursor-pointer">
          <IoExpand size={18} />
        </button>
        <button className=" cursor-pointer" type="button" onClick={onClose}>
          <IoClose size={20} />
        </button>
      </div>
      <div hidden={value === 0}>
        <CourseChat courseId={""} />
      </div>
      <div hidden={value === 1}>
        <CourseNav
          currentModule={currentModule}
          sections={sections}
          setCurrentModuleId={setCurrentModuleId}
          progress={progress}
          toggleCompleted={toggleCompleted}
        />
      </div>
    </div>
  );
};

export default CourseStructureNav;
