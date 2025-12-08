"use client";

import LoadingComponent from "@/common/utils/LoadingComponent";
import ClientFooter from "@/components/layout/ClientFooter";
import ContentArea from "@/components/study-area/ContentArea";
import StudyTabs from "@/components/study-area/StudyTabs";
import CourseStructureNav from "@/components/study-area/layout/CourseStructureNav";
import StudyHeader from "@/components/study-area/layout/StudyHeader";
import { useWindowWidth } from "@/hooks/useWindowWidth";
import { appToast } from "@/lib/appToast";
import appAxios from "@/lib/axiosClient";
import { cacheKeys } from "@/lib/cacheKeys";
import { BackendRoutes } from "@/routes";
import { useAppStore } from "@/store";
import { FaExpandArrowsAlt } from "@react-icons/all-files/fa/FaExpandArrowsAlt";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { use, useEffect, useMemo, useRef, useState } from "react";
import useFullCourseQuery from "../../../../create/course/useFetchFullCourse";
import useFetchCourseEnrolment from "../useFetchCourseEnrolment";
import useFetchCourseProgress from "../useFetchCourseProgress";

export default function Page({
  params,
}: {
  params: Promise<{ slug_id: string; module_id: string }>;
}) {
  const { slug_id, module_id } = use(params);
  const [moduleId, setModuleId] = useState<string>(module_id);
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [navHeight, setNavHeight] = useState("calc(100vh - 58px)");
  const windowsWidth = useWindowWidth({});
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAppStore((state) => state);
  const t = useTranslations();
  const {
    data,
    status,
    error,
    queryKey: courseQueryKey,
  } = useFullCourseQuery(slug_id, "student");

  const {
    data: progressData,
    status: progressStatus,
    queryKey: progressQueryKey,
  } = useFetchCourseProgress(data?.id);
  const {
    data: enrollmentData,
    status: enrollmentStatus,
    queryKey: enrollmentQueryKey,
  } = useFetchCourseEnrolment(data?.id);

  const queryClient = useQueryClient();

  // Sync moduleId with URL params when it changes
  useEffect(() => {
    if (module_id !== moduleId) {
      setModuleId(module_id);
    }
  }, [module_id, moduleId]);

  // Memoize query keys array to avoid recreation on every render
  const queryKeysToInvalidate = useMemo(
    () => [courseQueryKey, progressQueryKey, enrollmentQueryKey],
    [courseQueryKey, progressQueryKey, enrollmentQueryKey]
  );

  const { status: moduleStatus, data: moduleData } = useQuery({
    queryKey: [cacheKeys.MODULE_DETAIL_PAGE, moduleId, user?.id],
    queryFn: async (): Promise<FullModule> => {
      const res = await appAxios.get<any>(
        BackendRoutes.GET_FULL_MODULE(moduleId)
      );

      return res.data;
    },
    enabled: !!moduleId && !!user?.id,
  });

  const invalidateQueries = () => {
    queryKeysToInvalidate.forEach((key) => {
      queryClient.invalidateQueries({ queryKey: key });
    });
  };

  const { mutate: toggleCompleted } = useMutation({
    mutationFn: async (data: { module_id: string; status: boolean }) => {
      return await appAxios.post(BackendRoutes.TOGGLE_MODULE_COMPLETED, data);
    },
    onSuccess: invalidateQueries,
    onError(_, variables) {
      appToast.Error(
        t("ERROR_TOGGLING_COMPLETED", {
          completed: variables.status ? t("COMPLETED") : t("UNCOMPLETED"),
        })
      );
    },
  });

  const { mutate: incrementProgress } = useMutation({
    mutationFn: async (data: { module_id: string }) => {
      return await appAxios.post(BackendRoutes.INCREMENT_PROGRESS, data);
    },
    onSuccess: invalidateQueries,
    onError() {
      appToast.Error(t("INCREMENT_ERROR"));
    },
  });

  const handleModuleSelect = (id: string) => {
    setModuleId(id);
    if (pathname) {
      const newPath = pathname.replace(/[^/]+$/, id);
      const queryString = searchParams?.toString() ?? "";
      const hash = typeof window !== "undefined" ? window.location.hash : "";
      const url = queryString
        ? `${newPath}?${queryString}${hash}`
        : `${newPath}${hash}`;
      router.replace(url, { scroll: false });
    }
  };

  // Handle scroll events for nav height adjustment and snap effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const headerHeight = 58;

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Update scroll state
      setIsScrolled(scrollY > 0);

      // Adjust nav height based on scroll position
      if (scrollY > headerHeight) {
        setNavHeight("100vh");
      } else {
        setNavHeight("calc(100vh - 58px)");
      }

      // Implement snap effect
      if (scrollY > 0 && scrollY < headerHeight) {
        scrollTimeoutRef.current = setTimeout(() => {
          window.scrollTo({
            top: headerHeight,
            behavior: "smooth",
          });
        }, 150);
      } else if (scrollY > headerHeight && scrollY < headerHeight + 20) {
        scrollTimeoutRef.current = setTimeout(() => {
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }, 150);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const errorStatus = (error as AxiosError)?.response?.status;

  // Memoize marginStyle to avoid recalculation on every render
  const marginStyle = useMemo(
    () => ({
      marginRight:
        windowsWidth >= 1024 && !navCollapsed
          ? windowsWidth >= 1280
            ? "400px"
            : "300px"
          : "0px",
    }),
    [windowsWidth, navCollapsed]
  );

  return (
    <div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f7fafc;
          border-radius: 0px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 0px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }

        /* Smooth scroll behavior for snap effect */
        html {
          scroll-behavior: smooth;
        }

        /* Prevent scroll chaining during snap effect */
        body {
          overscroll-behavior-y: contain;
        }
      `}</style>
      <LoadingComponent
        loading={
          status === "pending" ||
          enrollmentStatus === "pending" ||
          moduleStatus === "pending"
        }
        error={
          status === "error" ||
          enrollmentStatus === "error" ||
          moduleStatus === "error"
        }
        errorStatus={errorStatus}
        data={{
          course: data as FullCourse,
          enrollment: enrollmentData as CourseEnrollment,
          progress: progressData as CourseProgress,
          module: moduleData as FullModule,
          moduleStatus,
        }}
      >
        {({ module, course, enrollment, progress, moduleStatus }) => (
          <>
            <StudyHeader
              course={course}
              enrollment={enrollment}
              progress={progress}
            />
            <main
              className={""}
              style={{
                ...marginStyle,
              }}
            >
              <section className="relative">
                <ContentArea
                  module={module}
                  isLoading={moduleStatus === "pending"}
                  course={course}
                  incrementProgress={incrementProgress}
                  setCurrentModuleId={handleModuleSelect}
                />
                <StudyTabs
                  sections={course.sections}
                  currentModule={module}
                  setCurrentModuleId={handleModuleSelect}
                  progress={progress}
                  course={course}
                  showContent={windowsWidth < 1024 || navCollapsed}
                  showChats={windowsWidth < 1024 || navCollapsed}
                  toggleCompleted={toggleCompleted}
                />
              </section>

              <button
                type="button"
                className={`hidden z-[200] cursor-pointer fixed px-6 py-4 bg-primary text-white  top-[30%] right-0 ${
                  windowsWidth >= 1024 && navCollapsed ? "!block" : ""
                }`}
                onClick={() => setNavCollapsed(false)}
              >
                <FaExpandArrowsAlt size={20} />
              </button>
              <section
                className={`hidden bg-white z-[300] right-0 overflow-y-auto lg:!block lg:w-[300px] xl:w-[400px] lg:fixed custom-scrollbar transition-all duration-300 ${
                  navCollapsed && "!-right-[400px]"
                }`}
                style={{
                  top: isScrolled ? "0px" : "58px",
                  height: navHeight,
                  scrollbarWidth: "thin",
                  scrollbarColor: "#cbd5e0 #f7fafc",
                }}
              >
                <CourseStructureNav
                  sections={course.sections}
                  currentModule={module}
                  courseId={course.id}
                  setCurrentModuleId={handleModuleSelect}
                  onClose={() => setNavCollapsed(!navCollapsed)}
                  progress={progress}
                  toggleCompleted={toggleCompleted}
                />
              </section>
            </main>
          </>
        )}
      </LoadingComponent>
      <ClientFooter
        style={{
          ...marginStyle,
        }}
      />
    </div>
  );
}
