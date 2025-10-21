"use client";

import LoadingComponent from "@/common/utils/LoadingComponent";
import ClientFooter from "@/components/layout/ClientFooter";
import { AppRoutes } from "@/routes";
import { AxiosError } from "axios";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { use, useEffect } from "react";
import useFullCourseQuery from "../../../create/course/useFetchFullCourse";
import useFetchCourseProgress from "./useFetchCourseProgress";

export default function Page({
  params,
}: {
  params: Promise<{ slug_id: string }>;
}) {
  const { slug_id } = use(params);
  const router = useRouter();
  const { data, status, error } = useFullCourseQuery(slug_id, "student");
  const t = useTranslations();

  const { data: progressData, status: progressStatus } = useFetchCourseProgress(
    data?.id
  );

  useEffect(() => {
    if (status === "success" && progressStatus !== "pending") {
      if (progressData?.next_module) {
        router.push(
          AppRoutes.getEnrolledCourseModuleRoute(
            slug_id,
            progressData.next_module
          )
        );
      } else {
        router.push(
          AppRoutes.getEnrolledCourseModuleRoute(
            slug_id,
            data.sections[0].modules[0].id
          )
        );
      }
    }
  }, [status, progressStatus, slug_id, data, progressData]);

  return (
    <>
      <LoadingComponent
        loading
        error={status === "error"}
        errorStatus={(error as AxiosError)?.response?.status}
      />
      <ClientFooter />
    </>
  );
}
