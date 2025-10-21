"use client";

import AppSelectField from "@/common/forms/AppSelectField";
import AppTextField from "@/common/forms/AppTextField";
import StringArrayInput from "@/common/forms/StringArrayInput";
import AppLinkBreadCrumbs from "@/common/utils/AppBreadCrumbs";
import { AppRoutes, BackendRoutes } from "@/routes";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Checkbox } from "@mui/material";
import { useTranslations } from "next-intl";
import { createContext, useCallback, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import LoadingModal from "@/common/popups/LoadingModal";
import { useRouter } from "@/hooks/useBlockNavigation";
import { appToast } from "@/lib/appToast";
import appAxios from "@/lib/axiosClient";
import { cacheKeys } from "@/lib/cacheKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import z from "zod";
import ExternalLink from "./fragments/AddLink";
import DiscussSections from "./fragments/DiscussionWrapper";
import DocumentUpload from "./fragments/DocumentUpload";
import VideoUpload from "./fragments/VideoUpload";

type contentType =
  | ({ type: "video" } & Omit<CreateVideoContent, "module_id">)
  | ({ type: "document" } & Omit<CreateDocumentContent, "module_id">);

export const ContentProvider = createContext<{
  setContentData: (value: contentType) => void;
  contentData?: contentType;
}>({} as any);

const moduleType = [
  "video",
  "document",
  "quiz",
  "discussion",
  "external_link",
] as const;

const optionalString = z.string().optional().or(z.literal(""));
const schema = z.object({
  title: z.string().min(3),
  description: optionalString,
  content_data: z.object({ content: optionalString }).optional(),
  order_index: z.number(),
  estimated_duration_minutes: z.number(),
  is_required: z.boolean().optional(),
  prerequisites: z.array(z.string()).optional(),
  settings: z.object({ additionalProp1: z.object({}).optional() }).optional(),
  module_type: z.enum(moduleType),
});

export default function ModuleForm({
  section_id,
  module,
  sections,
}: {
  section_id: string;
  module?: FullModule;
  sections: FullSection;
}) {
  const { id: module_id } = module || {};
  const router = useRouter();
  const form = useForm<z.infer<typeof schema>>({
    defaultValues: {
      module_type: module ? module.module_type : "video",
      content_data: module ? module.content_data : {},
      description: module ? module.description : "",
      estimated_duration_minutes: module
        ? module.estimated_duration_minutes
        : undefined,
      is_required: module ? module.is_required : false,
      order_index: module ? module.order_index : undefined,
      prerequisites: module ? module.prerequisites : [],
      settings: module ? module.settings : {},
      title: module ? module.title : "",
    },
    resolver: zodResolver(schema),
  });

  const initContent = module
    ? module.module_type === "document"
      ? {
          type: "document",
          embed_url: module.document_content.embed_url,
          external_file_id: module.document_content.external_file_id,
          file_url: module.document_content.file_url,
          platform: module.document_content.platform,
          file_name: module.document_content.file_name,
          file_type: module.document_content.file_type,
        }
      : {
          type: "video",
          embed_url: module.video_content.embed_url,
          external_video_id: module.video_content.external_video_id,
          video_url: module.video_content.video_url,
          platform: module.video_content.platform,
        }
    : undefined;

  const [contentData, setContentData] = useState<contentType>(
    initContent as any
  );

  const t = useTranslations();
  const queryClient = useQueryClient();

  const {
    control,
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const getAvailableIndex = useCallback(
    (modules: FullModule[], currentOrder?: number) => {
      if (modules.length < 1) return [[1, true]];

      const available = new Map(
        Array.from({ length: modules.length + 1 }, (_, i) => [i + 1, true])
      );

      modules.forEach((module) => {
        if (module.order_index !== currentOrder) {
          available.delete(module.order_index);
        }
      });

      return available.entries();
    },
    []
  );

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: Partial<CreateMoule>): Promise<FullModule> => {
      const url = module_id
        ? BackendRoutes.UPDATE_MODULE(module_id)
        : BackendRoutes.CREATE_MODULE;

      const reqFunc = module_id ? appAxios.patch : appAxios.post;
      return (await reqFunc(url, data)).data;
    },

    onError() {
      appToast.Error(t("MODULE.FAILED_CREATE_MODULE"));
    },
  });

  const revalidateAndRedirect = () => {
    queryClient.invalidateQueries({
      queryKey: [cacheKeys.COURSE_DETAIL, section_id],
    });
    router.push(AppRoutes.SECTION_MODULES(section_id));
  };

  const { mutate: mutateDocument, isPending: documentIsPending } = useMutation({
    mutationFn: async ({
      data,
      id,
    }: {
      data: CreateDocumentContent;
      id?: string;
    }): Promise<DocumentContent> => {
      const url = module_id
        ? BackendRoutes.UPDATE_DOCUMENT(id as any)
        : BackendRoutes.CREATE_DOCUMENT;
      const reqFunc = module_id ? appAxios.patch : appAxios.post;

      return (await reqFunc(url, data)).data;
    },

    onSuccess: () => {
      revalidateAndRedirect();
    },
    onError() {
      appToast.Error(t("MODULE.ATTACH_DOCUMENT"));
    },
  });

  const { mutate: mutateVideo, isPending: videoIsPending } = useMutation({
    mutationFn: async ({
      data,
      id,
    }: {
      data: CreateVideoContent;
      id?: string;
    }): Promise<VideoContent> => {
      const url = module_id
        ? BackendRoutes.UPDATE_VIDEO(id as any)
        : BackendRoutes.CREATE_VIDEO;
      const reqFunc = module_id ? appAxios.patch : appAxios.post;

      return (await reqFunc(url, data)).data;
    },

    onSuccess: () => {
      revalidateAndRedirect();
    },

    onError() {
      appToast.Error(t("MODULE.ATTACH_VIDEO"));
    },
  });

  const handleCreate = form.handleSubmit((params) => {
    if (
      (params.module_type === "document" || params.module_type === "video") &&
      !contentData
    ) {
      return appToast.Error(`add a ${params.module_type} to continue`);
    }

    mutate(
      {
        ...params,
        section_id,
      },
      {
        onSuccess(data) {
          if (contentData) appToast.Info(t("MODULE.SUBMITTING_CONTENT"));
          if (contentData?.type === "video") {
            mutateVideo({
              data: {
                external_video_id: contentData.external_video_id,
                platform: contentData.platform,
                module_id: data.id,
                video_url: contentData.video_url,
                embed_url: contentData.embed_url,
              },
              ...(module_id && { id: module?.video_content.id }),
            });
          } else if (contentData?.type === "document") {
            mutateDocument({
              data: {
                external_file_id: contentData.external_file_id,
                platform: contentData.platform,
                module_id: data.id,
                file_url: contentData.file_url,
                embed_url: contentData.embed_url,
                file_name: contentData.file_name,
                file_type: contentData.file_type,
              },
              ...(module_id && { id: module?.document_content.id }),
            });
          } else {
            revalidateAndRedirect();
          }
          appToast.Success(t("MODULE.MODULE_MESSAGE"));
        },
      }
    );
  });

  const isSubmitting = isPending || documentIsPending || videoIsPending;
  return (
    <>
      <div className="py-5 px-4">
        <AppLinkBreadCrumbs
          links={[
            {
              name: t("SECTIONS.COURSE_DETAILS"),
              to: AppRoutes.getCreatedCourseRoute(sections.course.slug),
            },
            {
              name: `${sections.title}`,
              to: AppRoutes.CREATED_COURSE_SECTION(sections.course.slug),
            },
            {
              name: t("MODULE.MODULES"),
              to: AppRoutes.SECTION_MODULES(sections.id),
            },
            ...(module_id
              ? [
                  {
                    name: t("MODULE.UPDATE"),
                    to: AppRoutes.EDIT_MODULE(sections.id, module_id),
                  },
                ]
              : [
                  {
                    name: t("MODULE.CREATE"),
                    to: AppRoutes.getCreateModuleRoute(sections.id),
                  },
                ]),
          ]}
        />

        <div></div>
        <ContentProvider value={{ setContentData, contentData }}>
          <FormProvider {...form}>
            <form className="space-y-8" onSubmit={handleCreate}>
              <div className="w-full flex flex-col gap-4 lg:flex-row">
                <AppTextField
                  control={control}
                  name="title"
                  fullWidth
                  placeholder={t("MODULE.TITLE")}
                />
                <AppTextField
                  control={control}
                  name="description"
                  fullWidth
                  placeholder={t("MODULE.DESCRIPTION")}
                />
              </div>

              <AppSelectField
                control={control}
                name="order_index"
                id="order_index"
                label={
                  <div className="text-[#111213]">{t("SECTIONS.ORDER")}</div>
                }
                options={Array.from(
                  getAvailableIndex(sections.modules, module?.order_index)
                ).map(([value, _]) => ({
                  text: value.toString(),
                  value: value,
                }))}
                message={errors.order_index?.message}
              />

              <div>
                <h2 className="text-xl font-bold py-3">
                  {t("MODULE.PREREQUISITES")}
                </h2>
                <StringArrayInput name="prerequisites" />
              </div>

              <AppTextField
                fullWidth
                control={control}
                name="estimated_duration_minutes"
                placeholder={t("SECTIONS.ESTIMATE_DURATION")}
                message={errors.estimated_duration_minutes?.message}
                onChange={(e) => {
                  const value =
                    e.target.value === "" ? 0 : Number(e.target.value);

                  if (!Number.isNaN(value))
                    setValue("estimated_duration_minutes", value, {
                      shouldValidate: true,
                    });
                }}
              />

              <div className="flex items-center gap-4">
                <h5>{t("MODULE.REQUIRED")}</h5>
                <div>
                  <Checkbox {...register("is_required")} />
                </div>
              </div>

              {!module_id && (
                <div>
                  <AppSelectField
                    control={control}
                    name="module_type"
                    id="module_type"
                    label={
                      <div className="text-[#111213]">
                        {t("MODULE.MODULE_TYPE")}
                      </div>
                    }
                    options={[
                      t("MODULE.MODULE_TYPES.VIDEO"),
                      t("MODULE.MODULE_TYPES.DOCUMENT"),
                      t("MODULE.MODULE_TYPES.DISCUSSION"),
                      t("MODULE.MODULE_TYPES.EXTERNAL_LINK"),
                    ].map((value) => ({
                      text: value.toString(),
                      value: value,
                    }))}
                    message={errors.prerequisites?.message}
                    onChange={(v) => {
                      setValue("module_type", v.target.value as any, {
                        shouldValidate: true,
                      });
                      setContentData(undefined as any);
                    }}
                  />
                </div>
              )}
              <div>
                <div
                  className={`hidden ${
                    watch("module_type") === "video" && "!block"
                  }`}
                >
                  <VideoUpload />
                </div>
                <div
                  className={`hidden ${
                    watch("module_type") === "document" && "!block"
                  }`}
                >
                  <DocumentUpload />
                </div>
                <div
                  className={`hidden ${
                    watch("module_type") === "discussion" && "!block"
                  }`}
                >
                  <DiscussSections
                    value={watch("content_data.content")}
                    setContent={(data: string) =>
                      setValue("content_data.content", data, {
                        shouldValidate: true,
                      })
                    }
                  />
                </div>
                <div
                  className={`hidden ${
                    watch("module_type") === "external_link" && "!block"
                  }`}
                >
                  <ExternalLink
                    value={watch("content_data.content")}
                    setContent={(data: string) =>
                      setValue("content_data.content", data, {
                        shouldValidate: true,
                      })
                    }
                    setError={(data: string) =>
                      form.setError("content_data.content", {
                        message: data,
                        type: "onChange",
                      })
                    }
                    error={errors.content_data?.content?.message}
                  />
                </div>
              </div>

              <div>
                <Button className="w-full lg:!w-auto" type="submit">
                  {module_id ? t("UPDATE") : t("SUBMIT")}
                </Button>
              </div>
            </form>
          </FormProvider>
        </ContentProvider>
        {isSubmitting && <LoadingModal />}
      </div>
    </>
  );
}
