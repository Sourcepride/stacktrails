"use client";

import LoadingComponent from "@/common/utils/LoadingComponent";
import CourseForm from "@/components/course-create/CourseForm";
import { use } from "react";
import useFullCourseQuery from "../../useFetchFullCourse";

export default function Page({
  params,
}: {
  params: Promise<{
    slug_id: string;
  }>;
}) {
  const { slug_id: slug } = use(params);

  const { status, data, isLoading } = useFullCourseQuery(slug);

  return (
    <LoadingComponent
      loading={isLoading}
      data={data as FullCourse}
      error={status === "error"}
    >
      {(cleanedData) => <CourseForm course={cleanedData} />}
    </LoadingComponent>
  );
}
