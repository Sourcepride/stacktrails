"use client";

import { cacheKeys } from "@/lib/cacheKeys";
import { getCourseProgress } from "@/lib/http/coursesFetchFunc";
import { useAppStore } from "@/store";
import { useQuery } from "@tanstack/react-query";

export default function useFetchCourseProgress(course_id?: string) {
  const { user } = useAppStore((state) => state);

  const queryKey = [cacheKeys.COURSE_PROGRESS, course_id, user?.id];
  const query = useQuery({
    queryKey,
    queryFn: getCourseProgress({ course_id: course_id as any }),
    enabled: !!user?.id && !!course_id,
  });

  const { status } = query;

  const isLoading = status === "pending";
  return {
    ...query,
    isLoading,
    queryKey,
  };
}
