"use client";

import LoadingComponent from "@/common/utils/LoadingComponent";
import SectionForm from "@/components/section-create/SectionForm";
import { use } from "react";
import useFullCourseQuery from "../../../useFetchFullCourse";

export default function Page({
  params,
}: {
  params: Promise<{
    slug_id: string;
  }>;
}) {
  const { slug_id: slug } = use(params);

  const { status, data, isLoading, queryKey } = useFullCourseQuery(slug);

  return (
    <LoadingComponent
      loading={isLoading}
      error={status === "error"}
      data={data as FullCourse}
    >
      {(cleanedData) => <SectionForm course={cleanedData} />}
    </LoadingComponent>
  );
}
