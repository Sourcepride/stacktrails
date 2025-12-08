"use client";

import AppSearchField from "@/common/forms/AppSearchField";
import AppSelectField from "@/common/forms/AppSelectField";
import AppTextField from "@/common/forms/AppTextField";
import LoadingModal from "@/common/popups/LoadingModal";
import { appToast } from "@/lib/appToast";
import appAxios from "@/lib/axiosClient";
import { BackendRoutes } from "@/routes";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Avatar,
  Button,
  Modal,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import z from "zod";
import SelectGroupMembers from "./SelectGroupMembers";
// Types are declared globally in chat.d.ts

type CreateStudyGroupProps = {
  onClose: () => void;
  courseId?: string;
};

// Base schema that will be refined based on chat type
const baseSchema = z.object({
  chat_type: z.enum(["DIRECT", "GROUP"]),
  name: z.string().optional(),
  description: z.string().optional(),
  privacy: z.enum(["PUBLIC", "PRIVATE", "RESTRICTED"]).optional(),
  associate_account: z.string().optional(),
  course_id: z.string().optional(),
});

// Refined schema based on chat type
const schema = baseSchema.superRefine((data, ctx) => {
  if (data.chat_type === "DIRECT") {
    // For direct chat, associate_account is required
    if (!data.associate_account) {
      ctx.addIssue({
        code: "custom",
        message: "Please select a member",
        path: ["associate_account"],
      });
    }
  } else if (data.chat_type === "GROUP") {
    // For group chat, name is required
    if (!data.name || data.name.trim().length < 3) {
      ctx.addIssue({
        code: "custom",
        message: "Group name must be at least 3 characters",
        path: ["name"],
      });
    }
    // Privacy defaults to PRIVATE if not provided
    if (!data.privacy) {
      data.privacy = "PRIVATE";
    }
  }
});

type FormData = z.infer<typeof schema>;

export default function CreateStudyGroup({
  onClose,
  courseId,
}: CreateStudyGroupProps) {
  const t = useTranslations();
  const [showMemberSelection, setShowMemberSelection] = useState(false);
  const [createdChatId, setCreatedChatId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const modalTitleRef = useRef<HTMLHeadingElement>(null);

  const form = useForm<FormData>({
    defaultValues: {
      chat_type: "DIRECT",
      name: "",
      description: "",
      privacy: "PRIVATE",
      associate_account: "",
      course_id: courseId || "",
    },
    resolver: zodResolver(schema),
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const chatType = watch("chat_type");

  // Search for enrolled users (for direct chat)
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ["search-accounts", courseId, searchQuery],
    queryFn: async (): Promise<Paginated<CourseEnrollment>> => {
      const response = await appAxios.get(
        BackendRoutes.GET_ENROLLED_USERS(courseId as string),
        {
          ...(searchQuery && { params: { q: searchQuery } }),
        }
      );
      return response.data;
    },
    enabled: !!courseId && chatType === "DIRECT",
  });

  // Create chat mutation
  const { mutate: createChat, isPending: isCreatingChat } = useMutation({
    mutationFn: async (data: ChatWrite): Promise<ChatRead> => {
      const response = await appAxios.post(BackendRoutes.CHAT, data);
      return response.data;
    },
    onSuccess: (data) => {
      if (chatType === "GROUP") {
        setCreatedChatId(data.id);
        setShowMemberSelection(true);
      } else {
        appToast.Success(t("CHAT.CHAT_CREATED"));
        onClose();
      }
    },
    onError: () => {
      appToast.Error(t("EXCEPTIONS.ERROR_OCCURRED") || "An error occurred");
    },
  });

  const handleChatTypeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newType: "DIRECT" | "GROUP" | null
  ) => {
    if (newType !== null) {
      setValue("chat_type", newType);
      // Reset form when switching types
      if (newType === "DIRECT") {
        setValue("name", "");
        setValue("description", "");
        setValue("privacy", "PRIVATE");
      } else {
        setValue("associate_account", "");
      }
    }
  };

  const onSubmit = handleSubmit((data) => {
    const chatData: ChatWrite = {
      chat_type: data.chat_type.toLowerCase() as any,
      name: data.chat_type === "GROUP" ? data.name || null : null,
      description: data.chat_type === "GROUP" ? data.description || null : null,
      privacy: (data.chat_type === "GROUP"
        ? (data.privacy as GroupChatPrivacy)
        : "PRIVATE"
      ).toLowerCase() as any,
      associate_account:
        data.chat_type === "DIRECT" ? data.associate_account || null : null,
      course_id: data.course_id || null,
      avatar_url: null,
      last_message_at: new Date().toISOString(),
    };
    createChat(chatData);
  });

  // Member selection screen
  if (showMemberSelection && createdChatId) {
    return (
      <SelectGroupMembers
        chatId={createdChatId}
        courseId={courseId}
        onClose={onClose}
        onBack={() => setShowMemberSelection(false)}
      />
    );
  }

  return (
    <>
      {isCreatingChat && <LoadingModal />}
      <Modal
        open
        onClose={onClose}
        aria-labelledby="create-chat-title"
        aria-describedby="create-chat-description"
        role="dialog"
        aria-modal="true"
      >
        <section
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[94%] max-w-[600px] bg-background rounded-2xl shadow-2xl p-4"
          role="dialog"
          aria-labelledby="create-chat-title"
          aria-describedby="create-chat-description"
        >
          <FormProvider {...form}>
            <form onSubmit={onSubmit} noValidate>
              <h2
                id="create-chat-title"
                className="text-xl font-semibold mb-4"
                tabIndex={-1}
                ref={modalTitleRef}
              >
                {t("CHAT.CREATE_CHAT")}
              </h2>
              <p id="create-chat-description" className="sr-only">
                {t("CHAT.CREATE_CHAT_DESCRIPTION")}
              </p>

              {/* Chat Type Toggle */}
              <fieldset className="mb-6">
                <legend className="sr-only">
                  {t("CHAT.CHAT_TYPE_SELECTION")}
                </legend>
                <ToggleButtonGroup
                  value={chatType}
                  exclusive
                  onChange={handleChatTypeChange}
                  aria-label={t("CHAT.CHAT_TYPE")}
                  aria-required="true"
                  fullWidth
                  sx={{
                    "& .MuiToggleButton-root": {
                      borderRadius: 2,
                      textTransform: "capitalize",
                      py: 1.5,
                      "&.Mui-selected": {
                        backgroundColor: (theme) =>
                          theme.vars?.palette.primary.main ?? "#1e90ff",
                        color: "#ffffff",
                        "&:hover": {
                          backgroundColor: (theme) =>
                            theme.vars?.palette.primary.main ?? "#1e90ff",
                        },
                      },
                    },
                  }}
                >
                  <ToggleButton
                    value="DIRECT"
                    aria-label={t("CHAT.DIRECT_CHAT")}
                    aria-pressed={chatType === "DIRECT"}
                  >
                    {t("CHAT.DIRECT_CHAT")}
                  </ToggleButton>
                  <ToggleButton
                    value="GROUP"
                    aria-label={t("CHAT.GROUP_CHAT")}
                    aria-pressed={chatType === "GROUP"}
                  >
                    {t("CHAT.GROUP_CHAT")}
                  </ToggleButton>
                </ToggleButtonGroup>
              </fieldset>

              {/* Direct Chat Fields */}
              {chatType === "DIRECT" && (
                <div
                  className="mb-6"
                  role="region"
                  aria-label={t("CHAT.DIRECT_CHAT_SETUP")}
                >
                  <div role="search" aria-label="Search for a member">
                    <AppSearchField
                      changeHandler={setSearchQuery}
                      data={searchResults?.items ?? []}
                      isLoading={isSearching}
                      displayComponent={(
                        enrollment: CourseEnrollment,
                        state,
                        onClick
                      ) => (
                        <div
                          className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                          onClick={() => {
                            setValue(
                              "associate_account",
                              enrollment.account.id
                            );
                            onClick(enrollment);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setValue(
                                "associate_account",
                                enrollment.account.id
                              );
                              onClick(enrollment);
                            }
                          }}
                          tabIndex={0}
                          role="option"
                          aria-label={`${
                            enrollment.account.profile?.display_name ||
                            enrollment.account.username
                          }, ${
                            enrollment.account.username
                          }. Press Enter to select.`}
                        >
                          <Avatar
                            src={enrollment.account.profile?.avatar}
                            alt={enrollment.account.username}
                            sx={{
                              background: (theme) =>
                                theme.vars?.palette.primary.main ?? "#1e90ff",
                              color: "#fff",
                            }}
                          >
                            {enrollment.account.username[0].toUpperCase()}
                          </Avatar>
                          <div>
                            <p className="text-black font-medium">
                              {enrollment.account.profile?.display_name ||
                                enrollment.account.username}
                            </p>
                            <p className="text-sm text-gray-600">
                              @{enrollment.account.username}
                            </p>
                          </div>
                        </div>
                      )}
                      textFieldProps={{
                        label: t("CHAT.SELECT_MEMBER"),
                        placeholder: t("CHAT.SEARCH_MEMBER_PLACEHOLDER"),
                        error: !!errors.associate_account,
                        helperText: errors.associate_account?.message,
                        id: "associate-account-search",
                        "aria-label": t("CHAT.SELECT_MEMBER"),
                        "aria-required": "true",
                        "aria-invalid": !!errors.associate_account,
                        "aria-describedby": errors.associate_account
                          ? "associate-account-error"
                          : "associate-account-help",
                      }}
                    />
                    {errors.associate_account && (
                      <p
                        id="associate-account-error"
                        className="text-xs text-red-600 mt-1"
                        role="alert"
                        aria-live="polite"
                      >
                        {errors.associate_account.message}
                      </p>
                    )}
                    <p id="associate-account-help" className="sr-only">
                      {t("CHAT.SEARCH_MEMBER_HELP")}
                    </p>
                  </div>
                  {watch("associate_account") && (
                    <p
                      className="text-xs text-gray-600 mt-2 block"
                      role="status"
                      aria-live="polite"
                    >
                      {t("CHAT.CHAT_WILL_BE_PRIVATE")}
                    </p>
                  )}
                </div>
              )}

              {/* Group Chat Fields */}
              {chatType === "GROUP" && (
                <div role="region" aria-label={t("CHAT.GROUP_CHAT_SETUP")}>
                  <div className="mb-6">
                    <AppTextField
                      control={control}
                      name="name"
                      label={t("CHAT.GROUP_NAME")}
                      required
                      fullWidth
                      message={errors.name?.message}
                      helperText={t("CHAT.GROUP_NAME_HELPER")}
                      aria-required="true"
                      aria-invalid={!!errors.name}
                      aria-describedby={
                        errors.name
                          ? "group-name-error group-name-help"
                          : "group-name-help"
                      }
                    />
                    {errors.name && (
                      <p
                        id="group-name-error"
                        className="text-xs text-red-600 mt-1"
                        role="alert"
                        aria-live="polite"
                      >
                        {errors.name.message}
                      </p>
                    )}
                    <p id="group-name-help" className="sr-only">
                      {t("CHAT.GROUP_NAME_HELPER")}
                    </p>
                  </div>

                  <div className="mb-6">
                    <AppTextField
                      control={control}
                      name="description"
                      label={t("CHAT.DESCRIPTION")}
                      multiline
                      rows={3}
                      fullWidth
                      optionalText
                      message={errors.description?.message}
                      aria-describedby={
                        errors.description
                          ? "group-description-error group-description-help"
                          : "group-description-help"
                      }
                    />
                    {errors.description && (
                      <p
                        id="group-description-error"
                        className="text-xs text-red-600 mt-1"
                        role="alert"
                        aria-live="polite"
                      >
                        {errors.description.message}
                      </p>
                    )}
                    <p id="group-description-help" className="sr-only">
                      {t("CHAT.DESCRIPTION_HELPER")}
                    </p>
                  </div>

                  <div className="mb-6">
                    <AppSelectField
                      control={control}
                      name="privacy"
                      id="privacy"
                      label={t("CHAT.PRIVACY")}
                      options={[
                        { value: "PRIVATE", text: t("CHAT.PRIVATE") },
                        { value: "PUBLIC", text: t("CHAT.PUBLIC") },
                        {
                          value: "RESTRICTED",
                          text: t("CHAT.RESTRICTED"),
                        },
                      ]}
                      defaultValue="PRIVATE"
                      message={errors.privacy?.message}
                      aria-describedby={
                        errors.privacy
                          ? "privacy-error privacy-help"
                          : "privacy-help"
                      }
                    />
                    {errors.privacy && (
                      <p
                        id="privacy-error"
                        className="text-xs text-red-600 mt-1"
                        role="alert"
                        aria-live="polite"
                      >
                        {errors.privacy.message}
                      </p>
                    )}
                    <p id="privacy-help" className="sr-only">
                      {t("CHAT.PRIVACY_HELPER")}
                    </p>
                  </div>
                </div>
              )}

              <div
                className="flex gap-4 justify-end mt-8"
                role="group"
                aria-label="Form actions"
              >
                <Button
                  onClick={onClose}
                  variant="outlined"
                  type="button"
                  aria-label={t("CANCEL")}
                >
                  {t("CANCEL")}
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isCreatingChat}
                  aria-label={
                    chatType === "DIRECT"
                      ? t("CHAT.CREATE_DIRECT_CHAT")
                      : t("CHAT.CREATE_GROUP_CHAT")
                  }
                  aria-busy={isCreatingChat}
                >
                  {isCreatingChat ? t("CHAT.CREATING") : t("CHAT.CREATE")}
                </Button>
              </div>
              <div
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="sr-only"
              >
                {isCreatingChat &&
                  (chatType === "DIRECT"
                    ? t("CHAT.CREATING_DIRECT_CHAT")
                    : t("CHAT.CREATING_GROUP_CHAT"))}
              </div>
            </form>
          </FormProvider>
        </section>
      </Modal>
    </>
  );
}
