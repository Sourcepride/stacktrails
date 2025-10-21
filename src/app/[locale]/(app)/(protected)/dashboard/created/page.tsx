"use client";

import CourseCard from "@/common/cards/CourseCard";
import PageHeaderText from "@/common/cards/PageHeader";
import StatCard from "@/common/cards/StatCard";
import SearchInput from "@/common/forms/SearchInput";
import TablePagination from "@/common/table/TablePagination";
import CenterOnLgScreen from "@/common/utils/CenterOnLgScreen";
import LoadingComponent from "@/common/utils/LoadingComponent";
import appAxios from "@/lib/axiosClient";
import { cacheKeys } from "@/lib/cacheKeys";
import { deBounce } from "@/lib/debounce";
import { getNumberUnit } from "@/lib/utils";
import { BackendRoutes } from "@/routes";
import { useAppStore } from "@/store";
import { AiFillLike } from "@react-icons/all-files/ai/AiFillLike";
import { FaCheckCircle } from "@react-icons/all-files/fa/FaCheckCircle";
import { IoMdChatbubbles } from "@react-icons/all-files/io/IoMdChatbubbles";
import { RiFolderSharedFill } from "@react-icons/all-files/ri/RiFolderSharedFill";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function Page() {
  const t = useTranslations();
  const { user } = useAppStore((state) => state);
  const [page, setPage] = useState(1);
  const [title, setTitle] = useState("");

  const {
    data: statData,
    status: statStatus,
    isLoading: isLoadingStat,
  } = useQuery({
    queryKey: [cacheKeys.CREATOR_STAT, user?.id],
    queryFn: async (): Promise<CreatorStat> => {
      const data = await appAxios.get(BackendRoutes.CREATORS_STATS);
      return data.data;
    },
  });

  const { data, status, isLoading } = useQuery({
    queryKey: [cacheKeys.CREATED_COURSE, user?.id, page, title],
    queryFn: async (): Promise<Paginated<FullCourse>> => {
      const data = await appAxios.get(BackendRoutes.CREATED_COURSE, {
        params: {
          title,
          page,
        },
      });
      return data.data;
    },
  });

  return (
    <LoadingComponent
      loading={isLoading || isLoadingStat}
      error={status === "error" || statStatus === "error"}
      data={{
        data: data as Paginated<FullCourse>,
        stat: statData as CreatorStat,
      }}
    >
      {({ data, stat }) => (
        <CenterOnLgScreen className="!py-8 space-y-10">
          <PageHeaderText
            headerText={t("NAVS.CREATED")}
            shortText={t("ENROLLED_TEXT")}
          />

          <div className="flex flex-col gap-6 lg:flex-row">
            <StatCard
              title={t("CREATED_COURSE.PUBLISHED")}
              value={getNumberUnit(stat.total_published)}
              icon={<RiFolderSharedFill />}
            />
            <StatCard
              title={t("CREATED_COURSE.ENROLLED_STUDENT")}
              value={getNumberUnit(stat.total_enrolled)}
              icon={<FaCheckCircle />}
            />
            <StatCard
              title={t("CREATED_COURSE.TOTAL_REVIEWS")}
              value={getNumberUnit(stat.total_reviews)}
              icon={<AiFillLike />}
            />
            <StatCard
              title={t("CREATED_COURSE.TOTAL_COMMENTS")}
              value={getNumberUnit(stat.total_comments)}
              icon={<IoMdChatbubbles />}
            />
          </div>

          <div className="space-y-6">
            <div className="flex items-center ">
              <div className="w-80">
                <SearchInput
                  placeholder={t("SEARCH_BY_TITLE")}
                  otherProps={{
                    onChange: deBounce(
                      (e: React.ChangeEvent<HTMLInputElement>) =>
                        setTitle(e.target.value),
                      800
                    ),
                    defaultValue: title,
                  }}
                />
              </div>
            </div>
            <div className="w-full grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
              {data.items.map((v) => (
                <CourseCard key={v.id} type="created" course={v} />
              ))}
            </div>

            <div className=" lg:flex lg:justify-end xl:justify-start">
              <TablePagination
                onChange={(_, page: number) => setPage(page)}
                currentPage={data.page ?? 1}
                totalPages={data.total_pages ?? 1}
              />
            </div>
          </div>
        </CenterOnLgScreen>
      )}
    </LoadingComponent>
  );
}
