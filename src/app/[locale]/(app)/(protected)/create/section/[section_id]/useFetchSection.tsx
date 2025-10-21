import { cacheKeys } from "@/lib/cacheKeys";
import { getSectionFn } from "@/lib/http/coursesFetchFunc";
import { useAppStore } from "@/store";
import { useQuery } from "@tanstack/react-query";

export default function useCourseSectionQuery(section_id: string) {
  const { user } = useAppStore((state) => state);

  const query = useQuery({
    queryKey: [cacheKeys.COURSE_DETAIL, section_id, user?.id],
    queryFn: getSectionFn({ section_id }),
    enabled: !!user?.id,
  });

  const { status } = query;

  return {
    ...query,
    isLoading: status === "pending",
    queryKey: [cacheKeys.COURSE_DETAIL, section_id, user?.id],
  };
}
