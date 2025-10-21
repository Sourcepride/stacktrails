import { Link } from "@/i18n/navigation";
import { IconButton } from "@mui/material";
import IconAndText from "./IconAndText";

import { getLanguageName, getNumberUnit } from "@/lib/utils";
import { PublicRoutes } from "@/routes";
import { Divider } from "@mui/material";
import { CiGlobe } from "@react-icons/all-files/ci/CiGlobe";
import { MdChat } from "@react-icons/all-files/md/MdChat";
import { MdGroups } from "@react-icons/all-files/md/MdGroups";
import { PiClockCountdown } from "@react-icons/all-files/pi/PiClockCountdown";
import { format, parseISO } from "date-fns";
import StarRating from "../courses/Stars";

type CourseDetailHeaderProps = {
  data: Course;
  t: any;
};

const CourseDetailHeader: React.FC<CourseDetailHeaderProps> = ({ data, t }) => {
  return (
    <div className="flex flex-col gap-6 relative">
      <h1 className="text-2xl font-black  md:text-3xl  lg:text-4xl">
        {data.title}
      </h1>
      <p className="line-clamp-3">{data.short_description}</p>
      <p>
        <span>{t("COURSE_DETAIL.CREATED_BY")}: </span>
        <Link href={PublicRoutes.getAuthor(data.author.username)}>
          {data.author.profile.display_name}
        </Link>
      </p>
      <div className="flex items-center gap-4 -translate-x-2">
        <IconAndText
          icon={
            <IconButton aria-label="Language" size="small" color="inherit">
              <CiGlobe />
            </IconButton>
          }
          text={<span>{getLanguageName(data.language)}</span>}
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
              {format(parseISO(data.updated_at), "MMMM yyyy")}
            </span>
          }
        />
      </div>
      <div className="flex gap-8 -left-1 rounded-2xl top-[calc(100%+1.5rem)]   xl:absolute  xl:bg-white xl:border xl:border-gray-300 xl:p-4 xl:text-black ">
        <div className="flex flex-col items-center gap-1">
          <h2 className="text-center font-bold text-2xl md:text-3xl ">
            {data.average_rating}
          </h2>
          <StarRating size="medium" rating={data.average_rating} />
          <p className="text-center text-xs  font-light py-1">
            {getNumberUnit(data.total_rating)} {t("COURSE_DETAIL.RATINGS")}
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
            {data.enrollment_count.toLocaleString()}
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
            {data.comment_count.toLocaleString()}
          </div>
          <div className="text-xs font-light">
            {t("COURSE_DETAIL.COMMUNITY_COMMENTS")}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailHeader;
