"use client";

import CourseCard from "@/common/cards/CourseCard";
import SearchInput from "@/common/forms/SearchInput";
import CenterOnLgScreen from "@/common/utils/CenterOnLgScreen";
import LoadingComponent from "@/common/utils/LoadingComponent";
import appAxios from "@/lib/axiosClient";
import { cacheKeys } from "@/lib/cacheKeys";
import { deBounce } from "@/lib/debounce";
import { BackendRoutes } from "@/routes";
import { Avatar, Button } from "@mui/material";
import {
  InfiniteData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useTranslations } from "next-intl";
import { use, useState } from "react";

export default function Page({ params }: { params: Promise<{ u: string }> }) {
  const { u: username } = use(params);
  const t = useTranslations();
  const [title, setTitle] = useState("");
  const { data, status, isLoading, error } = useQuery({
    queryKey: [cacheKeys.ACCOUNT_PROFILE, username],
    queryFn: async (): Promise<Profile> => {
      const data = await appAxios.get(BackendRoutes.USER_PROFILE(username));
      return data.data;
    },
  });
  const errorStatus = (error as AxiosError)?.response?.status;

  //   const {
  //     data: courses,
  //     status: coursesStatus,
  //     isLoading: isLoadingCourses,
  //   } = useQuery({
  //     queryKey: [cacheKeys.ACCOUNT_COURSES, username],
  //     queryFn: async (): Promise<Paginated<Course>> => {
  //       const data = await appAxios.get(BackendRoutes.ACCOUNT_COURSES(username));
  //       return data.data;
  //     },
  //   });

  const {
    data: courses,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingCourses,
    status: coursesStatus,
  } = useInfiniteQuery({
    queryKey: [cacheKeys.ACCOUNT_COURSES, username, title],
    queryFn: async (): Promise<Paginated<Course>> => {
      const data = await appAxios.get(BackendRoutes.ACCOUNT_COURSES(username), {
        params: {
          title,
        },
      });
      return data.data;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.has_next ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
  });

  return (
    <LoadingComponent
      loading={isLoading || isLoadingCourses}
      data={{
        data: data as Profile,
        courses: courses as InfiniteData<Paginated<Course>>,
      }}
      error={status === "error" || coursesStatus === "error"}
      errorStatus={errorStatus}
    >
      {({ data, courses }) => (
        <div className="min-h-[calc(100vh-360px)]">
          <div className="flex flex-col items-center justify-center  px-4 py-8">
            {/* Avatar */}
            <Avatar
              alt={data.display_name || data.username || "User Avatar"}
              src={data?.avatar ?? undefined}
              sx={{ width: 120, height: 120 }}
            />

            {/* Display Name */}
            {data.display_name && (
              <h1 className="mt-4 text-2xl font-bold text-gray-900">
                {data.display_name}
              </h1>
            )}

            {/* Username */}
            {username && (
              <p className="mt-1 text-gray-500 text-lg">@{username}</p>
            )}

            {/* Bio */}
            {data.bio && (
              <p className="mt-4 text-center text-gray-700 max-w-lg whitespace-pre-line">
                {data.bio}
              </p>
            )}
          </div>

          <CenterOnLgScreen>
            <div className="py-16">
              <div className="mb-8 flex items-center justify-between">
                <h1 className="text-xl font-bold ">Created courses</h1>
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
              <div className="space-y-4">
                {courses.pages.map((page, i) => (
                  <div
                    key={"page__" + i}
                    className="w-full grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]"
                  >
                    {page.items.map((course: Course) => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </div>
                ))}

                {hasNextPage && (
                  <div className="flex justify-center pt-4">
                    <Button
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      variant="outlined"
                    >
                      {isFetchingNextPage
                        ? `${t("LOADING")}...`
                        : t("LOAD_MORE")}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CenterOnLgScreen>
        </div>
      )}
    </LoadingComponent>
  );
}
