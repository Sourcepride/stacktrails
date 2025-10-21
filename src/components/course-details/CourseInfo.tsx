import { IconButton } from "@mui/material";
import { BsBackpack2Fill } from "@react-icons/all-files/bs/BsBackpack2Fill";
import { FaMedal } from "@react-icons/all-files/fa/FaMedal";
import { HiMiniSquare3Stack3D } from "@react-icons/all-files/hi2/HiMiniSquare3Stack3D";
import { IoIosAlarm } from "@react-icons/all-files/io/IoIosAlarm";
import { IoCheckmarkDoneOutline } from "@react-icons/all-files/io5/IoCheckmarkDoneOutline";

type CourseInfoProps = {
  data: Course;
  t: any;
};

// objectives = [
//   "Build responsive websites with HTML5 and CSS3",
//   "Master JavaScript ES6+ and modern frameworks",
//   "Create dynamic web applications with React",
//   "Build backend APIs with Node.js and Express",
//   "Work with databases (MongoDB, PostgreSQL)",
//   "Deploy applications to cloud platforms",
//   "Implement authentication and security",
//   "Use Git and GitHub for version control",
// ],
// prerequisites = [
//   "Basic computer skills",
//   "No programming experience required",
//   "Willingness to learn and practice",
// ],

const level = {
  beginner: "DIFFICULTY_LEVEL.BEGINNER",
  intermediate: "DIFFICULTY_LEVEL.INTERMEDIATE",
  advanced: "DIFFICULTY_LEVEL.ADVANCED",
  expert: "DIFFICULTY_LEVEL.EXPERT",
  all: "DIFFICULTY_LEVEL.ALL",
};

const CourseInfo: React.FC<CourseInfoProps> = ({ data, t }) => {
  const features = [
    {
      value: t(level[data.difficulty_level as keyof typeof level]),
      icon: <HiMiniSquare3Stack3D />,
    },
    {
      value:
        data.enrollment_type === "open"
          ? t("COURSE_DETAIL.OPEN")
          : data.enrollment_type,
      icon: <BsBackpack2Fill />,
    },
    {
      value: t("COURSE_DETAIL.APPROXIMATELY", {
        num: data.estimated_duration_hours,
      }),
      icon: <IoIosAlarm />,
    },
  ];

  return (
    <section className="space-y-8">
      {/* What You'll Learn */}
      <div className="rounded-xl border border-gray-300 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {t("COURSE_DETAIL.WHAT_YOU_WILL_LEARN")}
        </h2>
        <div className="grid gap-4 text-sm font-light grid-cols-1 md:grid-cols-2 ">
          {data.learning_objectives?.map((objective, index) => (
            <div key={"objective" + index} className="flex items-start gap-3">
              <IconButton
                aria-label="Objective"
                size="small"
                color="inherit"
                className="!p-0 !min-w-0"
              >
                <IoCheckmarkDoneOutline className="flex-shrink-0 mt-0.5" />
              </IconButton>
              <span className="text-gray-700 text-sm leading-relaxed">
                {objective}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Prerequisites */}
      {Array.isArray(data.prerequisites) && (
        <div className="rounded-xl  py-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t("COURSE_DETAIL.REQUIREMENTS")}
          </h2>
          <ul className="space-y-3">
            {data.prerequisites?.map((prerequisite, index) => (
              <li
                key={"prerequisites" + index}
                className="flex items-start gap-3"
              >
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                <span className="text-gray-700 text-sm">{prerequisite}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Course Features */}
      <div className="rounded-xl py-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {t("COURSE_DETAIL.COURSE_FEATURES")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.certification_enabled && (
            <div className="flex items-center gap-3">
              <IconButton
                aria-label="Objective"
                size="small"
                color="inherit"
                className="!p-0 !min-w-0"
              >
                {<FaMedal />}
              </IconButton>
              <span className="text-gray-700 text-sm">
                {t("COURSE_DETAIL.CERTIFICATE")}
              </span>
            </div>
          )}
          {features.map(({ value, icon }, index) => (
            <div key={"features" + index} className="flex items-center gap-3">
              <IconButton
                aria-label="Objective"
                size="small"
                color="inherit"
                className="!p-0 !min-w-0"
              >
                {icon}
              </IconButton>
              <span className="text-gray-700 text-sm">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CourseInfo;
