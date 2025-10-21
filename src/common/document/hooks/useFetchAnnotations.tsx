import appAxios from "@/lib/axiosClient";
import { cacheKeys } from "@/lib/cacheKeys";
import { BackendRoutes } from "@/routes";
import { useAppStore } from "@/store";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

type params = {
  docId?: string;
  setState: React.Dispatch<
    React.SetStateAction<{
      annotations: PdfCustomAnnotation[];
      highlights: Highlight[];
    }>
  >;
};

export default function useFetchAnnotations({ docId, setState }: params) {
  const { user } = useAppStore((state) => state);

  const { data, status } = useQuery({
    queryKey: [cacheKeys.USER_ANNOTATIONS, user?.id],
    queryFn: async (): Promise<AnnotationResp[]> => {
      return (
        await appAxios.get(BackendRoutes.GET_MY_ANNOTATIONS(docId as any))
      ).data;
    },
    enabled: !!docId,
  });

  useEffect(() => {
    if (status === "success") {
      setState((s) => ({
        ...s,
        highlights: data
          .filter((d) => d.type === "highlight")
          .map(
            (d) =>
              ({
                id: d.id,
                page: d.page_number || 1,
                quads: Array.isArray((d?.meta_data as any)?.quads)
                  ? (d?.meta_data as any)?.quads
                  : [],
              } as any)
          ),

        annotations: data
          .filter((d) => d.type === "note")
          .map(
            (d) =>
              ({
                id: d.id,
                page: d.page_number || 1,
                point: (d.meta_data as any)?.point ?? { x: 0, y: 0 },
                text: d.content,
                type: "note",
              } as any)
          ),
      }));
    }
  }, [status]);
}
