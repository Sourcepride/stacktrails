"use client";

import { cacheKeys } from "@/lib/cacheKeys";
import { hasEnrolled } from "@/lib/http/coursesFetchFunc";
import { AppRoutes } from "@/routes";
import { useAppStore } from "@/store";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function useFetchCourseEnrolment(course_id?: string) {
  const { user } = useAppStore((state) => state);
  const router = useRouter();

  const queryKey = [cacheKeys.GET_ENROLLMENT, course_id, user?.id];

  const query = useQuery({
    queryKey,
    queryFn: hasEnrolled({ courseId: course_id as any }),
    enabled: !!user?.id && !!course_id,
  });

  const { data, status } = query;

  useEffect(() => {
    if (status === "error") router.push(AppRoutes.DASHBOARD);
  }, [data, user]);

  const isLoading = status === "pending" || data?.account_id !== user?.id;
  return {
    ...query,
    isLoading,
    queryKey,
  };
}
