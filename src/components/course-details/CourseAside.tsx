"use client";

import { Link } from "@/i18n/navigation";
import { appToast } from "@/lib/appToast";
import { cacheKeys } from "@/lib/cacheKeys";
import {
  freeEnrollment,
  getCourseDetailFn,
  hasEnrolled,
} from "@/lib/http/coursesFetchFunc";
import { getImageProxyUrl, getNumberUnit } from "@/lib/utils";
import { AppRoutes } from "@/routes";
import { useAppStore } from "@/store";
import { Button, IconButton, Skeleton } from "@mui/material";
import { FaFacebookF } from "@react-icons/all-files/fa/FaFacebookF";
import { FaLayerGroup } from "@react-icons/all-files/fa/FaLayerGroup";
import { FaLinkedinIn } from "@react-icons/all-files/fa/FaLinkedinIn";
import { FaWhatsapp } from "@react-icons/all-files/fa/FaWhatsapp";
import { FaXTwitter } from "@react-icons/all-files/fa6/FaXTwitter";
import { MdGroups } from "@react-icons/all-files/md/MdGroups";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import StarRating from "../courses/Stars";
import IconAndText from "./IconAndText";

type CourseAsideProps = {
  isPreview?: boolean;
};

const CourseAside: React.FC<CourseAsideProps> = ({ isPreview }) => {
  const t = useTranslations("COURSE_DETAIL");
  const tl = useTranslations("DIFFICULTY_LEVEL");
  const { slug_id } = useParams<{ slug_id: string }>();

  const { data } = useSuspenseQuery({
    queryKey: [cacheKeys.COURSE_DETAIL, slug_id],
    queryFn: getCourseDetailFn({ slug: slug_id }),
  });

  const [isSticky, setIsSticky] = useState(false);
  const [imageSrc, setImgSrc] = useState(
    getImageProxyUrl(data.image) || "/placeholder.png"
  );

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsSticky(scrollTop > 70);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const level = useMemo(
    () => ({
      beginner: tl("BEGINNER"),
      intermediate: tl("INTERMEDIATE"),
      advanced: tl("ADVANCED"),
      expert: tl("EXPERT"),
      all: tl("ALL"),
    }),
    [tl]
  );

  return (
    <div
      className={`${
        isSticky ? "top-4" : "top-[calc(70px+4rem)]"
      } right-[50%]   rounded-lg py-2 group transition-all duration-300 xl:text-black xl:bg-white xl:w-[400px]  xl:[box-shadow:0px_4px_15px_4px_rgba(0,0,0,0.2)] xl:translate-x-[148%] xl:fixed xl:block`}
    >
      <div className="relative w-full aspect-video overflow-hidden ">
        <Image
          src={imageSrc}
          alt={"course thumbnail"}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          style={{ objectFit: "cover" }}
          className="block"
          onError={() => setImgSrc("/placeholder.png")}
        />
      </div>

      <div className="p-4 flex flex-col gap-4 font-light">
        <p className="text-sm">{data.short_description}</p>
        {isPreview ? (
          <Button> CTA Button </Button>
        ) : (
          <EnrollCTAButton course_id={data.id} slug={slug_id} />
        )}

        <div className="hidden  items-center gap-1 xl:flex">
          <StarRating rating={data.average_rating} size="medium" />
          <span className="font-medium">{data.average_rating}</span>
        </div>

        <div className="hidden text-sm justify-between items-center xl:flex">
          <IconAndText
            icon={
              <IconButton aria-label="Enrolled" size="small" color="inherit">
                <MdGroups />
              </IconButton>
            }
            text={
              <span>
                {getNumberUnit(data.enrollment_count)} {t("ENROLLED")}
              </span>
            }
          />
          <IconAndText
            icon={
              <IconButton aria-label="Level" size="small" color="inherit">
                <FaLayerGroup />
              </IconButton>
            }
            text={
              <span>{level[data.difficulty_level as keyof typeof level]}</span>
            }
          />
        </div>
        <div className="hidden xl:block">
          <div className="text-center text-sm">{t("LIFETIME_ACCESS")}</div>
          <div className="text-center text-sm">{t("SHARE_ON")}</div>
        </div>

        {/* Social Share Icons */}
        <div className="hidden items-center justify-center gap-4 xl:block">
          <IconButton
            size="medium"
            className="hover:!bg-gray-100"
            onClick={() =>
              window.open(
                "https://x.com/intent/tweet?text=Check out this amazing course!",
                "_blank"
              )
            }
          >
            <FaXTwitter className="w-5 h-5 text-black" />
          </IconButton>
          <IconButton
            size="medium"
            className="hover:!bg-gray-100"
            onClick={() =>
              window.open(
                "https://www.facebook.com/sharer/sharer.php?u=" +
                  encodeURIComponent(window.location.href),
                "_blank"
              )
            }
          >
            <FaFacebookF className="w-5 h-5 text-black" />
          </IconButton>
          <IconButton
            size="medium"
            className="hover:!bg-gray-100"
            onClick={() =>
              window.open(
                "https://www.linkedin.com/sharing/share-offsite/?url=" +
                  encodeURIComponent(window.location.href),
                "_blank"
              )
            }
          >
            <FaLinkedinIn className="w-5 h-5 text-black" />
          </IconButton>
          <IconButton
            size="medium"
            className="hover:!bg-gray-100"
            onClick={() =>
              window.open(
                "https://wa.me/?text=" +
                  encodeURIComponent(
                    "Check out this amazing course! " + window.location.href
                  ),
                "_blank"
              )
            }
          >
            <FaWhatsapp className="w-5 h-5 text-black" />
          </IconButton>
        </div>
      </div>
    </div>
  );
};

export default CourseAside;

function EnrollCTAButton({
  course_id,
  slug,
}: {
  course_id: string;
  slug: string;
}) {
  const account_id = useAppStore((state) => state.user?.id);
  const queryClient = useQueryClient();
  const t = useTranslations();

  const { data, isLoading } = useQuery({
    queryKey: [cacheKeys.GET_ENROLLMENT, course_id],
    queryFn: hasEnrolled({ courseId: course_id }),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: freeEnrollment,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [cacheKeys.COURSE_DETAIL],
      });
      queryClient.invalidateQueries({
        queryKey: [cacheKeys.GET_ENROLLMENT, course_id],
      });

      appToast.Success("Enrollment successful!");
    },
    onError: () => {
      appToast.Error("An error occurred! please try again or contact support!");
    },
  });

  if (isLoading) {
    return <Skeleton className="!w-full !rounded-md  !h-16" />;
  }

  if (data?.course_id === course_id) {
    return (
      <Link href={AppRoutes.getEnrolledCourseRoute(slug)}>
        <Button
          fullWidth
          size="large"
          color={"accentColor" as any}
          className=" !font-bold  !text-white"
        >
          {t("COURSE_DETAIL.HEAD_TO_COURSE")}
        </Button>
      </Link>
    );
  }

  const mutateHandler = () => {
    if (!account_id) return appToast.Info("Log in to enroll");
    mutate({ account_id, course_id });
  };

  return (
    <Button
      fullWidth
      size="large"
      color={"accentColor" as any}
      className=" !font-bold  !text-white"
      onClick={mutateHandler}
      disabled={isPending}
    >
      {t("COURSE_DETAIL.ENROLL_NOW")}
    </Button>
  );
}
