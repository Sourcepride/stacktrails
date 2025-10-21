"use client";
import MarkdownRenderer from "@/common/markdown/AppMdRenderer";
import ExpandableContent from "@/common/utils/ExpandableContent";
import IconAndText from "@/components/course-details/IconAndText";
import StarRating from "@/components/courses/Stars";
import { Link } from "@/i18n/navigation";
import { getLanguageName, getNumberUnit } from "@/lib/utils";
import { PublicRoutes } from "@/routes";
import { Avatar, Divider, IconButton } from "@mui/material";
import { CiGlobe } from "@react-icons/all-files/ci/CiGlobe";
import { MdChat } from "@react-icons/all-files/md/MdChat";
import { MdGroups } from "@react-icons/all-files/md/MdGroups";
import { PiClockCountdown } from "@react-icons/all-files/pi/PiClockCountdown";
import { format, parseISO } from "date-fns";
import { useTranslations } from "next-intl";

type SummaryProps = {
  course: FullCourse;
};
const Summary: React.FC<SummaryProps> = ({ course }) => {
  const t = useTranslations();
  return (
    <div className="space-y-8">
      <section className="w-full space-y-4">
        <p className="text-xl font-light">{course.short_description}</p>
        <div className="flex gap-8  rounded-2xl ">
          <div className="flex flex-col items-center gap-1">
            <h2 className="text-center font-bold text-2xl md:text-3xl ">
              {course.average_rating}
            </h2>
            <StarRating size="medium" rating={course.average_rating} />
            <p className="text-center text-xs  font-light py-1">
              {getNumberUnit(course.total_rating)} {t("COURSE_DETAIL.RATINGS")}
            </p>
          </div>
          <Divider
            orientation="vertical"
            sx={{
              height: "60px",
              borderColor: "rgba(0,0,0,0.2)",
              alignSelf: "center",
            }}
          />

          <div className="flex flex-col items-center gap-1">
            {/* <IconButton aria-label="Enrolled" size="large" color="inherit">
       
     </IconButton> */}
            <MdGroups className="w-8 h-8" />
            <div className=" font-semibold">
              {course.enrollment_count.toLocaleString()}
            </div>
            <div className="text-xs font-light">
              {t("COURSE_DETAIL.ENROLLED")}
            </div>
          </div>

          <Divider
            orientation="vertical"
            sx={{
              height: "60px",
              borderColor: "rgba(0,0,0,0.2)",
              alignSelf: "center",
            }}
          />

          <div className="flex flex-col items-center gap-1 xl:translate-y-2">
            {/* <IconButton aria-label="Enrolled" size="large" color="inherit">
       
     </IconButton> */}
            <MdChat className="w-6 h-6" />
            <div className=" font-semibold">
              {course.comment_count.toLocaleString()}
            </div>
            <div className="text-xs font-light">
              {t("COURSE_DETAIL.COMMUNITY_COMMENTS")}
            </div>
          </div>
        </div>
        <p>
          <span>{t("COURSE_DETAIL.CREATED_BY")}: </span>
          <Link href={PublicRoutes.getAuthor(course.author.username)}>
            {course.author.profile.display_name}
          </Link>
        </p>

        <div className="flex items-center gap-4 -translate-x-2">
          <IconAndText
            icon={
              <IconButton aria-label="Language" size="small" color="inherit">
                <CiGlobe />
              </IconButton>
            }
            text={<span>{getLanguageName(course.language)}</span>}
          />
          <IconAndText
            icon={
              <IconButton aria-label="Language" size="small" color="inherit">
                <PiClockCountdown />
              </IconButton>
            }
            text={
              <span>
                {t("COURSE_DETAIL.LAST_UPDATED")}{" "}
                {format(parseISO(course.updated_at), "MMMM yyyy")}
              </span>
            }
          />
        </div>
      </section>

      <Divider className="!my-8" />

      <section className="w-full">
        <h2 className="font-bold text-gray-900 mb-4">
          {t("COURSE_DETAIL.FULL_DESCRIPTION")}
        </h2>
        <ExpandableContent maxLines={8} showGradient={false}>
          <MarkdownRenderer content={course?.description || ""} />
        </ExpandableContent>
      </section>
      <Divider className="!my-8" />
      <section>
        <ExpandableContent maxLines={8} showGradient={false}>
          <div className="flex mb-4 gap-2 items-center">
            <Avatar
              src={course.author.profile.avatar}
              sx={{
                height: 70,
                width: 70,
                backgroundColor: (theme) =>
                  theme.vars?.palette.accentColor.main ?? "#1e90ff",
                fontWeight: 600,
              }}
            >
              {course.author.username.substring(0, 2).toUpperCase()}
            </Avatar>
            <div className="">
              <h3 className="font-bold">
                {" "}
                {course.author.profile?.display_name || course.author.username}
              </h3>
              <small>{course.author.username}</small>
            </div>
          </div>
          {course.author.profile.bio && (
            <div className="space-y-2 pl-2">
              <h3 className="font-bold mb-4">{t("COURSE_DETAIL.BIO")}</h3>
              <p>{course.author.profile.bio}</p>
            </div>
          )}
        </ExpandableContent>
      </section>
    </div>
  );
};

export default Summary;
