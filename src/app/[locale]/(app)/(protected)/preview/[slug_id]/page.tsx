"use client";

import CenterOnLgScreen from "@/common/utils/CenterOnLgScreen";
import LoadingComponent from "@/common/utils/LoadingComponent";
import AuthorsBio from "@/components/course-details/AuthorsBio";
import CourseAside from "@/components/course-details/CourseAside";
import CourseDetailHeader from "@/components/course-details/CourseDetailHeader";
import CourseInfo from "@/components/course-details/CourseInfo";

import Module from "@/components/course-details/detail-parts/Module";
import Section from "@/components/course-details/detail-parts/Section";
import FullDescription from "@/components/course-details/FullDescription";
import { getQueryClient } from "@/lib/get-query-client";
import { Button, Skeleton } from "@mui/material";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { PropsWithChildren, Suspense, use, useState } from "react";
import useFullCourseQuery from "../../create/course/useFetchFullCourse";

type props = {
  params: Promise<{ slug_id: string }>;
};

export default function Page({ params }: props) {
  const { slug_id: slug } = use(params);
  const t = useTranslations();

  const queryClient = getQueryClient();

  const { data, isLoading, status } = useFullCourseQuery(slug);

  return (
    <LoadingComponent
      loading={isLoading}
      error={status === "error"}
      data={data as FullCourse}
    >
      {(validData) => (
        <main className="">
          <section className={"w-full   bg-[#04111F] text-[#fffdfd]"}>
            <CenterOnLgScreen props={{ component: "div" }} className="">
              <ContentContainer>
                <CourseDetailHeader data={validData} t={t} />
              </ContentContainer>

              <HydrationBoundary state={dehydrate(queryClient)}>
                <Suspense
                  fallback={
                    <div className="w-full  max-w-[400px]  rounded-2xl shadow">
                      <Skeleton className="w-full h-80" />
                    </div>
                  }
                >
                  <CourseAside isPreview />
                </Suspense>
              </HydrationBoundary>
            </CenterOnLgScreen>
          </section>
          <CenterOnLgScreen
            props={{ component: "section" }}
            className="min-h-[calc(100vh-370px)]"
          >
            <ContentContainer>
              <div className="w-full flex flex-col gap-10 py-16 xl:pr-8">
                <CourseInfo data={validData} t={t} />

                <HydrationBoundary state={dehydrate(queryClient)}>
                  <Suspense
                    fallback={
                      <div className="w-full flex flex-col gap-4">
                        {Array.from({ length: 10 }, (_, i) => (
                          <Skeleton
                            key={`section-sus${i}`}
                            className="w-full h-8"
                          />
                        ))}
                      </div>
                    }
                  >
                    <CourseSections sections={validData.sections} />
                  </Suspense>
                </HydrationBoundary>

                <FullDescription data={validData} t={t} />

                <AuthorsBio data={validData} />
              </div>
            </ContentContainer>
          </CenterOnLgScreen>
        </main>
      )}
    </LoadingComponent>
  );
}

function ContentContainer({ children }: PropsWithChildren) {
  return (
    <div className="flex justify-center ">
      <div className={`w-full max-w-[80ch]`}>{children}</div>
      <div
        aria-hidden
        className="hidden xl:block xl:invisible xl:w-[400px]"
      ></div>
    </div>
  );
}

const CourseSections: React.FC<{ sections: FullSection[] }> = ({
  sections,
}) => {
  const t = useTranslations();

  const [showAll, setShowAll] = useState(false);
  const visibleSections = showAll ? sections : sections.slice(0, 10);
  const remaining = sections.length - 10;

  return (
    <section className="">
      <h2 className="text-2xl capitalize font-bold text-gray-900 mb-6">
        {t("COURSE_DETAIL.COURSE_SECTIONS")}
      </h2>

      <div className="space-y-2">
        {visibleSections.map((section, i) => (
          <Section
            key={section.id}
            title={section.title}
            defaultExpanded={i === 0}
          >
            <div className="grid gap-2">
              {section.modules.map((data) => (
                <Module key={data.id} data={data} showDescription />
              ))}
            </div>
          </Section>
        ))}
        {!showAll && sections.length > 10 && (
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setShowAll(true)}
            sx={{ mt: 2 }}
          >
            {t("COURSE_DETAIL.SEE_ALL_REMAINING")} {remaining}{" "}
            {remaining === 1 ? "section" : "sections"}
          </Button>
        )}
      </div>
    </section>
  );
};
