"use client";

import LoadingComponent from "@/common/utils/LoadingComponent";
import SectionForm from "@/components/section-create/SectionForm";
import { use } from "react";
import useFullCourseQuery from "../../../course/useFetchFullCourse";
import useCourseSectionQuery from "../useFetchSection";

export default function Page({
  params,
}: {
  params: Promise<{
    section_id: string;
  }>;
}) {
  const { section_id } = use(params);

  const { data, status, isLoading } = useCourseSectionQuery(section_id);
  const {
    data: courseData,
    status: courseStatus,
    isLoading: loadingCourse,
  } = useFullCourseQuery(data?.course?.slug);

  return (
    <LoadingComponent
      loading={isLoading || loadingCourse}
      error={status === "error" || courseStatus === "error"}
      data={{
        section: data as FullSection,
        course: courseData as FullCourse,
      }}
    >
      {({ course, section }) => (
        <SectionForm course={course} section={section} />
      )}
    </LoadingComponent>
  );
}
