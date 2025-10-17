"use client";

import StatCard from "@/common/cards/StatCard";
import WelcomeCard from "@/common/cards/WelcomeCard";
import CenterOnLgScreen from "@/common/utils/CenterOnLgScreen";
import LoadingComponent from "@/common/utils/LoadingComponent";
import appAxios from "@/lib/axiosClient";
import { cacheKeys } from "@/lib/cacheKeys";
import { BackendRoutes } from "@/routes";
import { useAppStore } from "@/store";
import { Button } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { FaCheckCircle, FaFolderPlus, FaHourglassHalf } from "react-icons/fa";

export default function Page() {
  const { user } = useAppStore((state) => state);
  const t = useTranslations();

  const { data, status, isLoading } = useQuery({
    queryKey: [cacheKeys.STUDENT_DASHBOARD, user?.id],
    queryFn: async (): Promise<StudentStat> => {
      const data = await appAxios.get(BackendRoutes.STUDENT_DASHBOARD);
      return data.data;
    },
  });
  const {
    data: enrolledData,
    status: enrolledStatus,
    isLoading: enrolledLoading,
  } = useQuery({
    queryKey: [cacheKeys.ENROLLED_COURSE, user?.id],
    queryFn: async (): Promise<Paginated<EnrolledCourse>> => {
      const data = await appAxios.get(BackendRoutes.ENROLLED_COURSES);
      return data.data;
    },
  });

  return (
    <LoadingComponent
      loading={isLoading || enrolledLoading}
      error={status === "error" || enrolledStatus === "error"}
      data={{
        stat: data as StudentStat,
        enrolled: (enrolledData?.items ?? []) as EnrolledCourse[],
      }}
    >
      {({ stat }) => (
        <CenterOnLgScreen className="!py-4">
          <div className=" space-y-8">
            <WelcomeCard />
            <div className="w-full flex items-center md:justify-end">
              <Button className="!capitalize">
                {t("PUBLIC_MAIN.CREATE_COURSE")}
              </Button>
            </div>
            <div className="flex flex-col gap-6 lg:flex-row">
              <StatCard
                title={t("DASHBOARD.IN_PROGRESS")}
                value={stat.in_progress}
                icon={<FaHourglassHalf />}
              />
              <StatCard
                title={t("DASHBOARD.COMPLETED")}
                value={stat.completed_courses}
                icon={<FaCheckCircle />}
              />
              <StatCard
                title={t("DASHBOARD.CREATED")}
                value={stat.created_courses}
                icon={<FaFolderPlus />}
              />
            </div>
          </div>
        </CenterOnLgScreen>
      )}
    </LoadingComponent>
  );
}
// in progress - created - chat rooms  -  completed
