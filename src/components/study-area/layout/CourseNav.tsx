"use client";

import NavModule from "./NavModule";
import NavSection from "./NavSection";

type CourseNavProps = {
  sections: FullSection[];
  progress?: CourseProgress;
  currentModule: FullModule;
  setCurrentModuleId: (id: string) => void;
  toggleCompleted: toggleCompletedType;
};
const CourseNav: React.FC<CourseNavProps> = ({
  sections,
  currentModule,
  setCurrentModuleId,
  progress,
  toggleCompleted,
}) => {
  return (
    <>
      {sections.map((section) => (
        <NavSection
          key={section.id}
          title={section.title}
          defaultExpanded={section.id === currentModule.section_id}
        >
          <div className="grid ">
            {section.modules.map((data) => (
              <NavModule
                key={data.id}
                data={data as FullModule}
                selected={currentModule.id === data.id}
                onClick={() => {
                  if (currentModule.id !== data.id) {
                    setCurrentModuleId(data.id);
                  }
                }}
                completed={(
                  progress?.progress_data as any
                )?.finished_modules?.find((v: any) => v === data.id)}
                toggleCompleted={toggleCompleted}
              />
            ))}
          </div>
        </NavSection>
      ))}
    </>
  );
};

export default CourseNav;
