"use client";

import CourseCard from "@/common/cards/CourseCard";
import PageHeaderText from "@/common/cards/PageHeader";
import TablePagination from "@/common/table/TablePagination";
import CenterOnLgScreen from "@/common/utils/CenterOnLgScreen";
import LoadingComponent from "@/common/utils/LoadingComponent";
import appAxios from "@/lib/axiosClient";
import { cacheKeys } from "@/lib/cacheKeys";
import { BackendRoutes } from "@/routes";
import { useAppStore } from "@/store";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function Page() {
  const t = useTranslations();
  const { user } = useAppStore((state) => state);
  const [page, setPage] = useState(1);
  const { data, status, isLoading } = useQuery({
    queryKey: [cacheKeys.ENROLLED_COURSE, page, user?.id],
    queryFn: async (): Promise<Paginated<EnrolledCourse>> => {
      const data = await appAxios.get(BackendRoutes.ENROLLED_COURSES, {
        params: {
          // title,
          page,
        },
      });
      return data.data;
    },
  });

  return (
    <LoadingComponent
      loading={isLoading}
      error={status === "error"}
      data={data as Paginated<EnrolledCourse>}
    >
      {(validData) => (
        <CenterOnLgScreen className="!py-8 space-y-10">
          <PageHeaderText
            headerText={t("NAVS.ENROLLED")}
            shortText={t("ENROLLED_TEXT")}
          />
          <div>
            <div className="w-full grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
              {validData.items.map((v) => (
                <CourseCard
                  key={v.course.id}
                  enrollment={v.enrollment}
                  type="enrolled"
                  course={v.course}
                />
              ))}
            </div>
            <div className="py-4 lg:flex lg:justify-end xl:justify-start">
              <TablePagination
                onChange={(_, page: number) => setPage(page)}
                currentPage={validData.page ?? 1}
                totalPages={validData.total_pages ?? 1}
              />
            </div>
          </div>
        </CenterOnLgScreen>
      )}
    </LoadingComponent>
  );
}
