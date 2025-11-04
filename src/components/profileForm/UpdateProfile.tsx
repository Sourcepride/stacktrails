"use client";

import AppSelectField from "@/common/forms/AppSelectField";
import AppTextField from "@/common/forms/AppTextField";
import ErrorMessage from "@/common/forms/ErrorMessage";
import LoadingModal from "@/common/popups/LoadingModal";
import { routing } from "@/i18n/routing";
import { appToast } from "@/lib/appToast";
import appAxios from "@/lib/axiosClient";
import { cacheKeys } from "@/lib/cacheKeys";
import { deBounce } from "@/lib/debounce";
import { getLanguageName } from "@/lib/utils";
import { BackendRoutes } from "@/routes";
import { useAppStore } from "@/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Modal } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import z from "zod";

const optionalString = z.string().optional().or(z.literal(""));

const noUrlHandle = optionalString.superRefine((v, ctx) => {
  if (v && /^https?:\/\//i.test(v)) {
    ctx.addIssue({
      code: "custom", // ✅ no longer uses ZodIssueCode
      message: "Provide a username, not a URL",
    });
  }
});

const schema = z.object({
  username: z.string().min(3),
  display_name: optionalString,
  bio: optionalString,
  x: noUrlHandle,
  youtube: noUrlHandle,
  facebook: noUrlHandle,
  tiktok: noUrlHandle,
  website: z.string().url().optional().or(z.literal("")),
  instagram: noUrlHandle,
  language: optionalString,
});

type UpdateProfileProps = {
  onClose: () => void;
};

const LANGUAGES = routing.locales.map((code) => ({
  value: code,
  text: getLanguageName(code, "en"),
}));

const UpdateProfile: React.FC<UpdateProfileProps> = ({ onClose }) => {
  const t = useTranslations();
  const { user, currentProfile, setCurrentProfile } = useAppStore((s) => s);

  const form = useForm<z.infer<typeof schema>>({
    defaultValues: {
      username: user?.username || "",
      display_name: currentProfile?.display_name || "",
      bio: currentProfile?.bio || "",
      language: undefined,
      x: currentProfile?.x,
      youtube: currentProfile?.youtube,
      facebook: currentProfile?.facebook,
      tiktok: currentProfile?.tiktok,
      website: currentProfile?.website,
      instagram: currentProfile?.instagram,
    },
    resolver: zodResolver(schema),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    watch,
  } = form;

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (
      data: Omit<Profile, "account_id" | "id" | "username">
    ) => {
      const resp = await appAxios.patch(
        BackendRoutes.USER_PROFILE(user?.username as any),
        data
      );
      return resp.data;
    },
    onSuccess(data) {
      setCurrentProfile({ ...currentProfile, ...data });
      appToast.Success(t("PROFILE_UPDATED"));
      queryClient.invalidateQueries({ queryKey: [cacheKeys.MY_ACCOUNT] });
    },
    onError() {
      appToast.Error(t("EXCEPTIONS.ERROR_OCCURRED"));
    },
  });
  const { mutate: updateUsername, isPending: isUpdatingUsername } = useMutation(
    {
      mutationFn: async (username: string) => {
        const resp = await appAxios.patch(
          BackendRoutes.UPDATE_USERNAME,
          username
        );
        return resp.data;
      },
      onSuccess() {
        appToast.Success(t("USERNAME_UPDATED"));
        queryClient.invalidateQueries({ queryKey: [cacheKeys.MY_ACCOUNT] });
      },
      onError() {
        appToast.Error(t("EXCEPTIONS.ERROR_OCCURRED"));
      },
    }
  );

  async function checkUsernameAvailability(username: string): Promise<boolean> {
    try {
      if (!username || username.length < 3) return true;
      const { data } = await appAxios.get(BackendRoutes.USERNAME_EXISTS, {
        params: {
          username,
        },
      });
      return !!(data && typeof data.ok === "boolean" ? data.ok : false);
    } catch {
      return false;
    }
  }

  const debouncedUsernameCheck = useMemo(
    () =>
      deBounce(async (value: string) => {
        if (!value || value.length < 3 || value === user?.username) {
          clearErrors("username");
          return;
        }
        const ok = await checkUsernameAvailability(value);
        if (ok) {
          setError("username", {
            type: "validate",
            message: (t("USERNAME_TAKEN") as any) || "Username is taken",
          });
        } else {
          clearErrors("username");
        }
      }, 600),
    [clearErrors, setError, t]
  );

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "username") {
        debouncedUsernameCheck((value?.username as any) || "");
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, debouncedUsernameCheck]);

  const onSubmit = handleSubmit(async (values) => {
    const { username, ...others } = values;

    mutate(others);
    if (username !== user?.username) updateUsername(username);
  });

  const isLoading = isPending || isUpdatingUsername;

  return (
    <Modal open onClose={onClose}>
      <section
        className="absolute top-1/2 left-1/2 w-[96%] max-w-[800px] max-h-[90%] overflow-y-auto bg-white rounded-2xl shadow-lg p-4"
        style={{ transform: "translate(-50%, -50%)" }}
      >
        {isLoading && <LoadingModal />}
        <FormProvider {...form}>
          <form onSubmit={onSubmit} className="grid gap-6">
            <h2 className="text-xl font-semibold">Update Profile</h2>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <AppTextField
                  control={control}
                  name="username"
                  id="username"
                  label="Username"
                  fullWidth
                  message={errors.username?.message}
                  required
                />
              </div>
              <div>
                <AppTextField
                  control={control}
                  name="display_name"
                  id="display_name"
                  label={t("DISPLAY_NAME")}
                  fullWidth
                  message={errors.display_name?.message}
                />
                <small>{t("DISPLAY_NAME_TEXT")}</small>
              </div>
            </div>

            <AppTextField
              control={control}
              name="bio"
              id="bio"
              label="Bio"
              fullWidth
              multiline
              minRows={3}
              message={errors.bio?.message}
              placeholder={t("ABOUT_YOU")}
            />

            <div className="grid gap-6 md:grid-cols-2">
              <AppSelectField
                control={control}
                name="language"
                id="language"
                label={<div className="text-[#111213]">{t("LANGUAGE")}</div>}
                options={LANGUAGES}
                message={errors.language?.message}
              />

              <AppTextField
                control={control}
                name="website"
                id="website"
                label={t("WEBSITE")}
                fullWidth
                message={errors.website?.message}
                placeholder={"https://website.com"}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <AppTextField
                control={control}
                name="x"
                id="x"
                label="X (Twitter)"
                fullWidth
                message={errors.x?.message}
                placeholder={t("USERNAME")}
              />
              <AppTextField
                control={control}
                name="instagram"
                id="instagram"
                label="Instagram"
                fullWidth
                message={errors.instagram?.message}
                placeholder={`@${t("USERNAME")}`}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <AppTextField
                control={control}
                name="facebook"
                id="facebook"
                label="Facebook"
                fullWidth
                message={errors.facebook?.message}
                placeholder={t("USERNAME")}
              />
              <AppTextField
                control={control}
                name="youtube"
                id="youtube"
                label="YouTube"
                fullWidth
                message={errors.youtube?.message}
                placeholder={`@${t("USERNAME")}`}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <AppTextField
                control={control}
                name="tiktok"
                id="tiktok"
                label="TikTok"
                fullWidth
                message={errors.tiktok?.message}
                placeholder={`@${t("USERNAME")}`}
              />
            </div>

            <ErrorMessage message={(errors as any)?.root?.message} />

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border px-4 py-2 text-sm"
              >
                {t("CANCEL")}
              </button>
              <Button type="submit">{t("UPDATE")}</Button>
            </div>
          </form>
        </FormProvider>
      </section>
    </Modal>
  );
};

export default UpdateProfile;
