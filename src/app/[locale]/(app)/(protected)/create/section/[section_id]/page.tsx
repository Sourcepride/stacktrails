// create new module
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
import Attachments from "./Attachments";
import ModuleDetail from "./ModuleDetail";
import useCourseSectionQuery from "./useFetchSection";

export default function Page({
  params,
}: {
  params: Promise<{
    section_id: string;
  }>;
}) {
  const t = useTranslations();
  const { section_id } = use(params);
  const [popUp, setPopUpState] = useState<FullModule | undefined>(undefined);

  const { status, data, isLoading } = useCourseSectionQuery(section_id);

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
      data={data as FullSection}
    >
      {(cleanedData) => (
        <div>
          <AppLinkBreadCrumbs
            links={[
              {
                name: t("SECTIONS.COURSE_DETAILS"),
                to: AppRoutes.getCreatedCourseRoute(cleanedData.course.slug),
              },
              {
                name: `${cleanedData.title}`,
                to: AppRoutes.CREATED_COURSE_SECTION(cleanedData.course.slug),
              },
              {
                name: t("MODULE.MODULES"),
                to: AppRoutes.SECTION_MODULES(cleanedData.id),
              },
            ]}
          />

          <div className="px-4">
            <h1 className="text-xl font-bold">
              {cleanedData.title} {t("MODULE.MODULES")}
            </h1>
            {cleanedData.modules.length < 1 && (
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
                <p className="">{t("MODULE.EMPTY")}</p>
                <div>
                  <Link href={AppRoutes.getCreateModuleRoute(cleanedData.id)}>
                    <Button className="!capitalize !font-bold" size="large">
                      {t("PUBLIC_HEADER.CREATE")}
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {cleanedData.modules.length > 0 && (
              <div className="">
                <section className="flex items-center justify-end px-4">
                  <Link href={AppRoutes.getCreateModuleRoute(section_id)}>
                    <Button className="!capitalize !font-bold" size="large">
                      {t("MODULE.CREATE")}
                    </Button>
                  </Link>
                </section>

                <section className="p-4 py-8">
                  <PageModules
                    modules={cleanedData.modules}
                    setPopUpState={setPopUpState}
                  />
                </section>
              </div>
            )}
          </div>
          {popUp && (
            <ModuleDetail
              data={popUp}
              onClose={() => setPopUpState(undefined)}
            />
          )}
        </div>
      )}
    </LoadingComponent>
  );
}

function PageModules({
  modules,
  setPopUpState,
}: {
  modules: FullModule[];
  setPopUpState: (val: FullModule) => any;
}) {
  const [items, setItems] = useState(modules);

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
          {items.map((module) => (
            <SortableSectionContainer
              setPopUpState={setPopUpState}
              key={module.id}
              module={module}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableSectionContainer({
  module,
  setPopUpState,
}: {
  module: FullModule;
  setPopUpState: (val: FullModule) => any;
}) {
  const [showAttachments, setShowAttachments] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: module.id });

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
        <h3 className="font-semibold">{module.title}</h3>

        {/* Drag handle */}
        <span {...listeners} className="cursor-grab">
          ⠿
        </span>
      </div>

      <p className="line-clamp-3 text-sm text-gray-600">{module.description}</p>

      <div className="flex gap-2 mt-4">
        <Button
          size="small"
          variant="outlined"
          onClick={() => setPopUpState(module)}
          className="!capitalize"
        >
          View
        </Button>

        <Button
          size="small"
          variant="contained"
          className="!capitalize"
          onClick={() => setShowAttachments(true)}
        >
          Attachments
        </Button>
      </div>
      {showAttachments && (
        <Attachments data={module} onClose={() => setShowAttachments(false)} />
      )}
    </div>
  );
}
