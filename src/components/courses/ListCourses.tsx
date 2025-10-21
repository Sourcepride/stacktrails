"use client";

import CourseCard from "@/common/cards/CourseCard";
import LoadingComponent from "@/common/utils/LoadingComponent";
import { cacheKeys } from "@/lib/cacheKeys";
import { getCoursesQueryFn } from "@/lib/http/coursesFetchFunc";
import { Button } from "@mui/material";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

type Props = {
  params?: Record<string, any>;
};

const ListCourse: React.FC<Props> = ({ params }) => {
  const t = useTranslations("LOADING");
  const key_ = params
    ? [cacheKeys.ALL_COURSES, params]
    : [cacheKeys.ALL_COURSES];
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery({
      queryKey: key_,
      queryFn: getCoursesQueryFn({ params }),
      getNextPageParam: (lastPage) => {
        return lastPage.has_next ? lastPage.page + 1 : undefined;
      },
      initialPageParam: 1,
    });

  return (
    <LoadingComponent loading={false} empty={data.pages[0].total < 1}>
      <div className="space-y-4">
        {data.pages.map((page, i) => (
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
              {isFetchingNextPage ? `${t("LOADING")}...` : t("LOAD_MORE")}
            </Button>
          </div>
        )}
      </div>
    </LoadingComponent>
  );
};

export default ListCourse;
