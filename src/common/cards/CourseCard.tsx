"use client";

import { Link } from "@/i18n/navigation";
import { getImageProxyUrl, getNumberUnit, timeAgo } from "@/lib/utils";
import { AppRoutes, PublicRoutes } from "@/routes";
import { LinearProgress } from "@mui/material";
import { FaStar } from "@react-icons/all-files/fa/FaStar";
import { MdOutlineComment } from "@react-icons/all-files/md/MdOutlineComment";
import { useTranslations } from "next-intl";
import Image from "next/image";
import React, { useState } from "react";

type CourseCardProps = {
  course: Course;
  // optional: let parent override sizing classes (e.g. "h-96")
  className?: string;
  heightClass?: string;
  type?: "created" | "enrolled" | "normal";
  enrollment?: CourseEnrollment;
};

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  className = "",
  heightClass = "h-80", // default card height; parent can override
  enrollment,
  type = "normal",
}) => {
  const t = useTranslations();
  const [imgSrc, setImgSrc] = useState(
    getImageProxyUrl(course.image) || "/placeholder.png"
  );

  const url =
    type === "normal"
      ? PublicRoutes.getCourseRoute(course.slug)
      : type === "enrolled"
      ? AppRoutes.getEnrolledCourseRoute(course.slug)
      : AppRoutes.getCreatedCourseRoute(course.slug);

  return (
    <article
      className={`w-full ${heightClass}  overflow-hidden rounded-lg flex flex-col ${className}`}
    >
      {/* Image area = 70% of height flex-[7] */}
      <Link href={url} className="block relative h-[62%] w-full">
        <Image
          src={imgSrc}
          alt={"course thumbnail"}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          style={{ objectFit: "cover" }}
          className="block rounded-2xl"
          onError={() => setImgSrc("/placeholder.png")}
        />
      </Link>

      {/* Content area = remaining 30% flex-[3] */}
      <div className="p-4 flex flex-col justify-between flex-1">
        <div>
          <Link href={url}>
            <h3 className="font-semibold line-clamp-2">{course.title}</h3>
          </Link>
          <Link
            href={PublicRoutes.getAuthor(course.author.username)}
            className="text-sm text-blue-600 hover:underline"
          >
            {course.author.username}
          </Link>
        </div>

        {enrollment && (
          <div className="w-full py-2 px-1 space-y-2">
            <p className="text-xs lowercase font-thin">
              {t("PROGRESS")} ({Math.round(enrollment.progress_percentage)}%)
            </p>
            {!!enrollment.progress_percentage && (
              <LinearProgress
                variant="determinate"
                value={enrollment.progress_percentage}
                color={"accentColor" as any}
              />
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-4  text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <FaStar className="text-yellow-500" />
              <span>{course.average_rating}</span>
            </div>

            <div className="flex items-center gap-2">
              <MdOutlineComment />
              <span>{getNumberUnit(course.comment_count)}</span>
            </div>
          </div>

          <div className="text-xs text-gray-400 mt-2">
            {timeAgo(course.updated_at)}
          </div>
        </div>
      </div>
    </article>
  );
};

export default CourseCard;
