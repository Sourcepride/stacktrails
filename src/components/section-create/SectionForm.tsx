"use client";

import AppSelectField from "@/common/forms/AppSelectField";
import AppTextField from "@/common/forms/AppTextField";
import StringArrayInput from "@/common/forms/StringArrayInput";
import AppLinkBreadCrumbs from "@/common/utils/AppBreadCrumbs";
import { appToast } from "@/lib/appToast";
import { cacheKeys } from "@/lib/cacheKeys";
import {
  createSectionFunction,
  updateSectionFunction,
} from "@/lib/http/coursesFetchFunc";
import { AppRoutes } from "@/routes";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Checkbox } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { FormProvider, useForm } from "react-hook-form";
import z from "zod";

const optionalString = z.string().optional().or(z.literal(""));

const progression_type = ["sequential", "flexible"] as const;
type progression_type_enum = (typeof progression_type)[number];

const schema = z.object({
  title: z.string(),
  description: optionalString,
  learning_objectives: z.array(z.string()).optional(),
  order_index: z.number(),
  estimated_duration_minutes: z.number().optional(),
  is_optional: z.boolean().optional(),
  progression_type: z.enum(progression_type),
  completion_criteria: z.array(z.string()).optional(),
});

type SectionFormProps = {
  course: FullCourse;
  section?: FullSection;
};
const SectionForm: React.FC<SectionFormProps> = ({
  course: { sections, slug, id: course_id },
  section,
}) => {
  const t = useTranslations();

  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof schema>>({
    defaultValues: {
      title: section?.title || "",
      description: section?.description || "",
      learning_objectives: section?.learning_objectives || [],
      order_index: section?.order_index,
      estimated_duration_minutes: section?.estimated_duration_minutes,
      is_optional: section?.is_optional || false,
      progression_type: (section?.progression_type as any) || "sequential",
      completion_criteria: section?.completion_criteria,
    },
    resolver: zodResolver(schema),
  });

  const {
    control,
    setValue,
    watch,
    register,
    formState: { errors },
    handleSubmit,
  } = form;

  const { mutate } = useMutation({
    mutationFn: async (data: CreateSection) => {
      if (section) return await updateSectionFunction(section.id, data);
      return await createSectionFunction(data);
    },
    onSuccess(data) {
      // TODO:  invalidate queries for created courses dashboard
      appToast.Success(
        t("SECTIONS.CREATED", {
          created: section ? t("UPDATED") : t("CREATED"),
        })
      );
      queryClient.invalidateQueries({
        queryKey: [cacheKeys.COURSE_DETAIL, slug],
      });
      router.push(AppRoutes.CREATED_COURSE_SECTION(slug));
    },

    onError() {
      appToast.Error(t("EXCEPTIONS.ERROR_OCCURRED"));
    },
  });

  const handleFormSubmit = handleSubmit((values) => {
    mutate({
      ...values,
      course_id,
    });
  });

  const getAvailableIndex = useCallback(
    (sections: FullSection[], currentOrder?: number) => {
      if (sections.length < 1) return [[1, true]];

      const available = new Map(
        Array.from({ length: sections.length + 1 }, (_, i) => [i + 1, true])
      );

      sections.forEach((section) => {
        if (section.order_index !== currentOrder) {
          available.delete(section.order_index);
        }
      });

      return available.entries();
    },
    []
  );

  return (
    <div className="px-4">
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
          ...[
            section
              ? {
                  name: section.title,
                  to: AppRoutes.EDIT_SECTION(section.id),
                }
              : {
                  name: t("PUBLIC_HEADER.CREATE"),
                  to: AppRoutes.CREATE_SECTION(slug),
                },
          ],
        ]}
      />
      <FormProvider {...form}>
        <form className={`space-y-8`} onSubmit={handleFormSubmit}>
          <h1 className="text-2xl font-bold lg:text-3xl">
            {t("SECTIONS.CREATE")}
          </h1>
          <div className="flex flex-col items-center gap-4 md:flex-row">
            <AppTextField
              control={control}
              name="title"
              placeholder={t("SECTIONS.TITLE")}
              fullWidth
              message={errors.title?.message}
            />
            <AppTextField
              control={control}
              name="description"
              placeholder={t("SECTIONS.DESCRIPTION")}
              fullWidth
              message={errors.description?.message}
            />
          </div>
          <div>
            <AppSelectField
              control={control}
              name="order_index"
              id="order_index"
              label={
                <div className="text-[#111213]">{t("SECTIONS.ORDER")}</div>
              }
              options={Array.from(
                getAvailableIndex(sections, section?.order_index)
              ).map(([value, _]) => ({
                text: value.toString(),
                value: value,
              }))}
              message={errors.order_index?.message}
            />
          </div>
          <div>
            <h2 className="text-xl font-bold">{t("SECTIONS.OBJECTIVES")}</h2>
            <StringArrayInput name="learning_objectives" />
          </div>
          <div>
            <h2 className="text-xl font-bold">
              {t("SECTIONS.COMPLETION_CRITERIA")}
            </h2>
            <StringArrayInput name="completion_criteria" />
          </div>
          <div>
            <AppSelectField
              control={control}
              name="progression_type"
              id="progression_type"
              label={
                <div className="text-[#111213]">
                  {t("SECTIONS.PROGRESSION_TYPE")}
                </div>
              }
              options={[t("SECTIONS.SEQUENTIAL"), t("SECTIONS.FLEXIBLE")].map(
                (value) => ({
                  text: value.toString(),
                  value: value,
                })
              )}
              message={errors.progression_type?.message}
            />
          </div>
          <div>
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
              <h5>{t("SECTIONS.OPTIONAL")}</h5>
              <div>
                <Checkbox {...register("is_optional")} />
              </div>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={!!Object.keys(errors).length}
              fullWidth
            >
              {section ? t("UPDATE") : t("SECTIONS.CREATE")}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default SectionForm;
