"use client";

import LoadingComponent from "@/common/utils/LoadingComponent";
import { use } from "react";

import ModuleForm from "@/components/module-create/ModuleForm";
import useCourseSectionQuery from "../useFetchSection";

export default function Page({
  params,
}: {
  params: Promise<{ section_id: string }>;
}) {
  const { section_id } = use(params);

  const { status, data, isLoading } = useCourseSectionQuery(section_id);

  return (
    <LoadingComponent
      loading={isLoading}
      error={status === "error"}
      data={data as FullSection}
    >
      {(cleanedData) => (
        <ModuleForm section_id={section_id} sections={cleanedData} />
      )}
    </LoadingComponent>
  );
}
