"use client";

import AppLinkBreadCrumbs from "@/common/utils/AppBreadCrumbs";
import LoadingComponent from "@/common/utils/LoadingComponent";
import { Link } from "@/i18n/navigation";
import { AppRoutes } from "@/routes";
import { closestCenter, DndContext, DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@mui/material";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { use, useState } from "react";
import useFullCourseQuery from "../../useFetchFullCourse";
import SectionDetail from "./SectionDetail";

export default function Page({
  params,
}: {
  params: Promise<{
    slug_id: string;
  }>;
}) {
  const t = useTranslations();
  const { slug_id: slug } = use(params);
  const [popUp, setPopUpState] = useState<Section | undefined>(undefined);

  const { status, data, isLoading } = useFullCourseQuery(slug);

  //   const { mutate, isPending } = useMutation({
  //     mutationFn: async (section_id: string, order: number) => {},
  //     onSuccess(_, variable) {
  //       appToast.Success("");
  //     },
  //     onError(_, variable) {
  //       appToast.Error("");
  //     },
  //   });

  //   const updateHandler = (section_id: string, order: number) => {};

  return (
    <LoadingComponent
      loading={isLoading}
      error={status === "error"}
      data={data as FullCourse}
    >
      {(cleanedData) => (
        <div>
          <AppLinkBreadCrumbs
            links={[
              {
                name: t("SECTIONS.COURSE_DETAILS"),
                to: AppRoutes.getCreatedCourseRoute(slug),
              },
              {
                name: t("SECTIONS.SECTIONS"),
                to: AppRoutes.CREATED_COURSE_SECTION(slug),
              },
            ]}
          />

          <div className="">
            {cleanedData.sections.length < 1 && (
              <div className="flex gap-2 flex-col items-center justify-center min-h-[200px] p-8">
                <div className="">
                  <Image
                    src={"/Empty-bro.svg"}
                    alt="Empty state"
                    width={320}
                    height={320}
                    className={` max-w-[320px] `}
                  />
                </div>
                <p className="">{t("SECTIONS.EMPTY")}</p>
                <div>
                  <Link href={AppRoutes.CREATE_SECTION(slug)}>
                    <Button className="!capitalize !font-bold" size="large">
                      {t("PUBLIC_HEADER.CREATE")}
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {cleanedData.sections.length > 0 && (
              <div className="">
                <section className="flex items-center justify-end px-4">
                  <Link href={AppRoutes.CREATE_SECTION(slug)}>
                    <Button className="!capitalize !font-bold" size="large">
                      {t("SECTIONS.CREATE")}
                    </Button>
                  </Link>
                </section>

                <section className="p-4 py-8">
                  <PageSections
                    sections={cleanedData.sections}
                    setPopUpState={setPopUpState}
                  />
                </section>
              </div>
            )}
          </div>
          {popUp && (
            <SectionDetail
              data={popUp}
              onClose={() => setPopUpState(undefined)}
            />
          )}
        </div>
      )}
    </LoadingComponent>
  );
}

function PageSections({
  sections,
  setPopUpState,
}: {
  sections: FullSection[];
  setPopUpState: (val: Section) => any;
}) {
  const [items, setItems] = useState(sections);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setItems((prev) => {
      const oldIndex = prev.findIndex((s) => s.id === active.id);
      const newIndex = prev.findIndex((s) => s.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={items.map((s) => s.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-4">
          {items.map((section) => (
            <SortableSectionContainer
              setPopUpState={setPopUpState}
              key={section.id}
              section={section}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableSectionContainer({
  section,
  setPopUpState,
}: {
  section: FullSection;
  setPopUpState: (val: Section) => any;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="border p-4 border-gray-300 rounded-lg shadow-sm"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{section.title}</h3>

        {/* Drag handle */}
        <span {...listeners} className="cursor-grab">
          ⠿
        </span>
      </div>

      <p className="line-clamp-3 text-sm text-gray-600">
        {section.description}
      </p>

      <div className="flex gap-2 mt-4">
        <Button
          size="small"
          variant="outlined"
          onClick={() => setPopUpState(section)}
        >
          View
        </Button>
        <Link href={AppRoutes.SECTION_MODULES(section.id)}>
          <Button size="small" variant="contained">
            See Modules
          </Button>
        </Link>
      </div>
    </div>
  );
}
