"use client";

import LoadingComponent from "@/common/utils/LoadingComponent";
import { use } from "react";

import ModuleForm from "@/components/module-create/ModuleForm";
import appAxios from "@/lib/axiosClient";
import { cacheKeys } from "@/lib/cacheKeys";
import { BackendRoutes } from "@/routes";
import { useQuery } from "@tanstack/react-query";
import useCourseSectionQuery from "../../useFetchSection";

export default function Page({
  params,
}: {
  params: Promise<{ section_id: string; module_id: string }>;
}) {
  const { section_id, module_id } = use(params);

  const { status, data, isLoading } = useCourseSectionQuery(section_id);

  const { status: moduleStatus, data: moduleData } = useQuery({
    queryKey: [cacheKeys.MODULE_DETAIL_PAGE, module_id],
    queryFn: async (): Promise<FullModule> => {
      const res = await appAxios.get<any>(
        BackendRoutes.GET_FULL_MODULE(module_id)
      );

      return res.data;
    },
  });

  return (
    <LoadingComponent
      loading={isLoading || moduleStatus === "pending"}
      error={status === "error" || moduleStatus === "error"}
      data={{ section: data as FullSection, module: moduleData as FullModule }}
    >
      {({ section, module }) => (
        <ModuleForm
          section_id={section_id}
          sections={section}
          module={module}
        />
      )}
    </LoadingComponent>
  );
}
