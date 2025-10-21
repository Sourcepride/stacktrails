"use client";

import MarkdownRenderer from "@/common/markdown/AppMdRenderer";
import LoadingComponent from "@/common/utils/LoadingComponent";
import { Link } from "@/i18n/navigation";
import { appToast } from "@/lib/appToast";
import { updateCourseFunction } from "@/lib/http/coursesFetchFunc";
import { getImageProxyUrl } from "@/lib/utils";
import { AppRoutes } from "@/routes";
import { Button, IconButton, Tooltip } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { useTranslations } from "next-intl";
import Image from "next/image";

import { BsBackpack2Fill } from "@react-icons/all-files/bs/BsBackpack2Fill";
import { FaMedal } from "@react-icons/all-files/fa/FaMedal";
import { HiMiniSquare3Stack3D } from "@react-icons/all-files/hi2/HiMiniSquare3Stack3D";
import { IoIosAlarm } from "@react-icons/all-files/io/IoIosAlarm";
import { IoMdArchive } from "@react-icons/all-files/io/IoMdArchive";
import { IoCloudUpload } from "@react-icons/all-files/io5/IoCloudUpload";
import { IoEye } from "@react-icons/all-files/io5/IoEye";
import { IoPencil } from "@react-icons/all-files/io5/IoPencil";
import { use, useCallback } from "react";
import useFullCourseQuery from "../useFetchFullCourse";

// review and update course

const level = {
  beginner: "DIFFICULTY_LEVEL.BEGINNER",
  intermediate: "DIFFICULTY_LEVEL.INTERMEDIATE",
  advanced: "DIFFICULTY_LEVEL.ADVANCED",
  expert: "DIFFICULTY_LEVEL.EXPERT",
  all: "DIFFICULTY_LEVEL.ALL",
};

export default function Page({
  params,
}: {
  params: Promise<{
    slug_id: string;
  }>;
}) {
  const t = useTranslations();
  const { slug_id: slug } = use(params);

  const { status, data, isLoading } = useFullCourseQuery(slug);

  const { mutate, isPending } = useMutation({
    mutationFn: async (status: "archived" | "published") =>
      await updateCourseFunction(slug, { status }),
    onSuccess(_, variable) {
      appToast.Success(
        t("CREATED_COURSE.SUCCESS", {
          published: variable === "archived" ? variable + "ed" : variable,
        })
      );
    },
    onError(_, variable) {
      appToast.Error(
        t("CREATED_COURSE.ERROR", {
          publish: variable === "published" ? "publish" : variable,
        })
      );
    },
  });

  const updateHandler = (should: "published" | "archived") => {
    const canPublish = (data as FullCourse)?.sections?.every(
      (section) => !!section.modules?.length
    );
    if (!canPublish) {
      appToast.Error(t("CREATED_COURSE.INSTRUCTION"));
      return;
    }

    mutate(should);
  };

  const features = useCallback(
    (data: Course) => [
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
    ],
    []
  );

  return (
    <LoadingComponent
      loading={isLoading}
      error={status === "error"}
      data={data as FullCourse}
    >
      {(cleanedData) => (
        <div className="px-4 xl:px-0">
          <section className="flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between ">
            <div className="">
              <Link href={AppRoutes.CREATED_COURSE_SECTION(slug)}>
                <Button
                  color="secondary"
                  className="!capitalize !font-bold w-full md:w-auto"
                >
                  {t("SECTIONS.CREATE")}
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-4 md:ml-auto">
              <Tooltip title={t("CREATED_COURSE.PREVIEW")}>
                <Link href={AppRoutes.getPreviewCreatedCourseRoute(slug)}>
                  <button
                    type="button"
                    className="p-2 cursor-pointer rounded-full  bg-gray-100 "
                  >
                    <IoEye className="w-5 h-5" />
                  </button>
                </Link>
              </Tooltip>

              <Tooltip title={t("CREATED_COURSE.EDIT")}>
                <Link href={AppRoutes.CREATED_COURSE_EDIT(slug)}>
                  <button
                    type="button"
                    className="p-2 cursor-pointer rounded-full  bg-gray-100  flex items-center gap-2"
                  >
                    <IoPencil className="w-5 h-5" />
                  </button>
                </Link>
              </Tooltip>

              <Tooltip title={t("CREATED_COURSE.INSTRUCTION")}>
                <Button
                  variant="outlined"
                  className="flex items-center  gap-2 !capitalize !font-bold"
                  //   color="error"
                  onClick={() => updateHandler("archived")}
                >
                  <span>Archive</span>
                  <IoMdArchive />
                </Button>
              </Tooltip>
              <Tooltip title={t("CREATED_COURSE.INSTRUCTION")}>
                <Button
                  className="flex items-center  gap-2 !capitalize !font-bold"
                  onClick={() => updateHandler("published")}
                >
                  <div>Publish</div>
                  <IoCloudUpload />
                </Button>
              </Tooltip>
            </div>
          </section>

          <div className="flex justify-center py-8">
            <div className="space-y-6 w-fit  ">
              <section className="flex flex-col gap-4 lg:flex-row">
                <div className="max-w-[80ch] space-y-4 order-2 lg:order-none ">
                  <h1 className="text-2xl font-bold lg:text-3xl">
                    {cleanedData.title}
                  </h1>
                  <p className="">{cleanedData.short_description}</p>
                  <div>
                    <p className="text-sm py-1 text-orange-500">
                      {t("CREATED_COURSE.INSTRUCTION")}
                    </p>
                    <Link href={AppRoutes.CREATED_COURSE_SECTION(slug)}>
                      <Button>{t("CREATED_COURSE.MANAGE")}</Button>
                    </Link>
                  </div>

                  <div className="flex flex-col gap-4 md:flex-row  md:gap-6 md:items-center">
                    <div>status: {cleanedData.status}</div>
                    <div>
                      last updated:{" "}
                      {format(parseISO(cleanedData.updated_at), "d, MMM, yyyy")}
                    </div>
                    <div>visibility: {cleanedData.visibility}</div>
                    <div>enrollment_type: {cleanedData.enrollment_type}</div>
                  </div>
                </div>

                <div className="relative order-1 w-full h-[220px] lg:w-[300px] lg:order-none">
                  <Image
                    src={
                      getImageProxyUrl(cleanedData?.image) || "/placeholder.png"
                    }
                    alt={"course thumbnail"}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    style={{ objectFit: "cover" }}
                    className="block rounded-xl"
                    unoptimized
                    //   onError={() => setImgSrc("/placeholder.png")}
                  />
                </div>
              </section>

              <section className="space-y-4 py-8">
                <h1 className="text-2xl font-bold">Course Details</h1>
                <div className="space-y-4">
                  <div className="w-full space-y-1">
                    <h2 className="font-bold text-xl">
                      {t("COURSE_DETAIL.FULL_DESCRIPTION")}
                    </h2>
                    <MarkdownRenderer content={cleanedData.description || ""} />
                  </div>
                </div>

                <div className="w-full space-y-1">
                  <h2 className="font-bold text-xl">
                    {t("CREATE_COURSE.LANGUAGE")}
                  </h2>
                  <p>{cleanedData.language}</p>
                </div>

                <div>
                  {Array.isArray(cleanedData.prerequisites) && (
                    <div className="rounded-xl  py-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        {t("CREATE_COURSE.PREREQUISITES")}
                      </h2>
                      <ul className="space-y-3">
                        {cleanedData.prerequisites?.map(
                          (prerequisite, index) => (
                            <li
                              key={"prerequisites" + index}
                              className="flex items-start gap-3"
                            >
                              <span className="w-2 h-2 bg-gray-800 rounded-full mt-2 flex-shrink-0"></span>
                              <span className=" text-sm">{prerequisite}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {t("CREATE_COURSE.OBJECTIVES")}
                  </h2>
                  <div className="grid gap-4  grid-cols-1 md:grid-cols-2 ">
                    {cleanedData.learning_objectives?.map(
                      (objective, index) => (
                        <div
                          key={"objective" + index}
                          className="flex items-start gap-3"
                        >
                          <span className="text-sm leading-relaxed">
                            {objective}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="rounded-xl py-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {t("COURSE_DETAIL.COURSE_FEATURES")}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cleanedData.certification_enabled && (
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
                    {features(cleanedData).map(({ value, icon }, index) => (
                      <div
                        key={"features" + index}
                        className="flex items-center gap-3"
                      >
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
            </div>
          </div>
        </div>
      )}
    </LoadingComponent>
  );
}
