"use client";

import AppSearchField from "@/common/forms/AppSearchField";
import LoadingModal from "@/common/popups/LoadingModal";
import { appToast } from "@/lib/appToast";
import appAxios from "@/lib/axiosClient";
import { BackendRoutes } from "@/routes";
import { Avatar, Button, IconButton, Modal, TextField } from "@mui/material";
import { FaTimes } from "@react-icons/all-files/fa/FaTimes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

type SelectGroupMembersProps = {
  chatId: string;
  courseId?: string;
  onClose: () => void;
  onBack?: () => void;
};

export default function SelectGroupMembers({
  chatId,
  courseId,
  onClose,
  onBack,
}: SelectGroupMembersProps) {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const modalTitleRef = useRef<HTMLHeadingElement>(null);
  const memberListRef = useRef<HTMLUListElement>(null);

  // Search for enrolled users
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
    enabled: !!courseId,
  });

  // Add members to group via invites mutation
  const { mutate: addMembers, isPending: isAddingMembers } = useMutation({
    mutationFn: async ({
      chatId,
      memberIds,
    }: {
      chatId: string;
      memberIds: string[];
    }) => {
      // Convert member IDs to chat invites
      const inviteData: ChatInviteBulkWrite = {
        data: memberIds.map((accountId) => ({
          chat_id: chatId,
          invited_account_id: accountId,
          is_active: true,
        })),
      };
      const response = await appAxios.post(
        BackendRoutes.CHAT_INVITE,
        inviteData
      );
      return response.data;
    },
    onSuccess: () => {
      appToast.Success(t("CHAT.MEMBERS_ADDED"));
      onClose();
    },
    onError: () => {
      appToast.Error(t("EXCEPTIONS.ERROR_OCCURRED") || "An error occurred");
    },
  });

  const handleMemberToggle = (accountId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(accountId)
        ? prev.filter((id) => id !== accountId)
        : [...prev, accountId]
    );
  };

  // Focus management for modal
  useEffect(() => {
    if (modalTitleRef.current) {
      modalTitleRef.current.focus();
    }
  }, []);

  // Keyboard navigation for member list
  const handleMemberKeyDown = (
    e: React.KeyboardEvent,
    memberId: string,
    index: number
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleMemberToggle(memberId);
    } else if (e.key === "ArrowDown" && memberListRef.current) {
      e.preventDefault();
      const nextItem = memberListRef.current.children[index + 1] as HTMLElement;
      if (nextItem) {
        nextItem.querySelector("article")?.focus();
      }
    } else if (e.key === "ArrowUp" && memberListRef.current) {
      e.preventDefault();
      const prevItem = memberListRef.current.children[index - 1] as HTMLElement;
      if (prevItem) {
        prevItem.querySelector("article")?.focus();
      }
    }
  };

  const handleAddMembers = () => {
    if (chatId && selectedMembers.length > 0) {
      addMembers({ chatId, memberIds: selectedMembers });
    }
  };

  const handleRemoveMember = (accountId: string) => {
    setSelectedMembers((prev) => prev.filter((id) => id !== accountId));
  };

  // Get selected members data
  const selectedMembersData =
    searchResults?.items.filter((member) =>
      selectedMembers.includes(member.account.id)
    ) || [];

  const availableMembers =
    searchResults?.items.filter(
      (member) => !selectedMembers.includes(member.account.id)
    ) || [];

  return (
    <>
      {isAddingMembers && <LoadingModal />}
      <Modal
        open
        onClose={onClose}
        aria-labelledby="member-selection-title"
        aria-describedby="member-selection-description"
        role="dialog"
        aria-modal="true"
      >
        <section
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[94%] max-w-[600px] bg-background rounded-2xl shadow-2xl p-4 max-h-[90vh] overflow-auto"
          role="dialog"
          aria-labelledby="member-selection-title"
          aria-describedby="member-selection-description"
        >
          <h2
            id="member-selection-title"
            className="text-xl font-semibold mb-2"
            tabIndex={-1}
            ref={modalTitleRef}
          >
            {t("CHAT.SELECT_MEMBERS")}
          </h2>
          <p
            id="member-selection-description"
            className="text-sm text-gray-600 mb-6"
          >
            {t("CHAT.SELECT_MEMBERS_DESCRIPTION")}
          </p>

          <div className="mb-6" role="search" aria-label="Search members">
            <label htmlFor="member-search-input" className="sr-only">
              {t("CHAT.SEARCH_MEMBERS")}
            </label>
            {courseId ? (
              <TextField
                id="member-search-input"
                label={t("CHAT.SEARCH_MEMBERS")}
                placeholder={t("CHAT.SEARCH_MEMBERS_PLACEHOLDER")}
                fullWidth
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label={t("CHAT.SEARCH_MEMBERS")}
                aria-describedby="member-search-description"
              />
            ) : (
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
                    className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-100 rounded"
                    onClick={() => onClick(enrollment)}
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
                  label: t("CHAT.SEARCH_MEMBERS"),
                  placeholder: t("CHAT.SEARCH_MEMBERS_PLACEHOLDER"),
                  id: "member-search-input",
                  "aria-label": t("CHAT.SEARCH_MEMBERS"),
                  "aria-describedby": "member-search-description",
                }}
              />
            )}
            <p id="member-search-description" className="sr-only">
              {t("CHAT.SEARCH_MEMBERS_DESCRIPTION")}
            </p>
          </div>

          {/* Selected Members Section */}
          {selectedMembers.length > 0 && (
            <div
              className="mb-6"
              role="region"
              aria-label="Selected members"
              aria-live="polite"
            >
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                {t("CHAT.SELECTED_MEMBERS")} ({selectedMembers.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedMembersData.map((member) => (
                  <div
                    key={member.account.id}
                    className="flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg"
                  >
                    <Avatar
                      src={member.account.profile?.avatar}
                      alt={member.account.username}
                      sx={{
                        width: 24,
                        height: 24,
                        background: (theme) =>
                          theme.vars?.palette.primary.main ?? "#1e90ff",
                        color: "#fff",
                        fontSize: "0.75rem",
                      }}
                    >
                      {member.account.username[0].toUpperCase()}
                    </Avatar>
                    <span className="text-sm font-medium text-gray-800">
                      {member.account.profile?.display_name ||
                        member.account.username}
                    </span>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveMember(member.account.id)}
                      aria-label={`Remove ${
                        member.account.profile?.display_name ||
                        member.account.username
                      } from selection`}
                      className="!p-1 !min-w-0 !w-5 !h-5"
                      sx={{
                        "&:hover": {
                          backgroundColor: "rgba(0, 0, 0, 0.1)",
                        },
                      }}
                    >
                      <FaTimes size={12} className="text-gray-600" />
                    </IconButton>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div
            className="mb-6 max-h-[400px] overflow-auto"
            role="region"
            aria-label="Available members"
            aria-live="polite"
            aria-atomic="false"
          >
            {availableMembers.length === 0 ? (
              <p
                className="text-sm text-gray-600 text-center py-8"
                role="status"
                aria-live="polite"
              >
                {t("CHAT.NO_MEMBERS_FOUND")}
              </p>
            ) : (
              <ul
                className="space-y-2"
                ref={memberListRef}
                role="listbox"
                aria-label="Available members to add"
                aria-multiselectable="true"
              >
                {availableMembers.map((member, index) => (
                  <li key={member.id} role="option">
                    <article
                      className={`flex items-center gap-4 p-4 mb-2 rounded cursor-pointer hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                        selectedMembers.includes(member.account.id)
                          ? "border-2 border-primary"
                          : "border border-gray-300"
                      }`}
                      onClick={() => handleMemberToggle(member.account.id)}
                      onKeyDown={(e) =>
                        handleMemberKeyDown(e, member.account.id, index)
                      }
                      tabIndex={0}
                      role="button"
                      aria-pressed={selectedMembers.includes(member.account.id)}
                      aria-label={`${
                        member.account.profile?.display_name ||
                        member.account.username
                      }, ${member.account.username}. ${
                        selectedMembers.includes(member.account.id)
                          ? "Selected"
                          : "Not selected"
                      }. Press Enter or Space to toggle selection.`}
                    >
                      <Avatar
                        src={member.account.profile?.avatar}
                        alt={member.account.username}
                        sx={{
                          background: (theme) =>
                            theme.vars?.palette.primary.main ?? "#1e90ff",
                          color: "#fff",
                        }}
                      >
                        {member.account.username[0].toUpperCase()}
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-black font-medium">
                          {member.account.profile?.display_name ||
                            member.account.username}
                        </p>
                        <p className="text-sm text-gray-600">
                          @{member.account.username}
                        </p>
                      </div>
                      {selectedMembers.includes(member.account.id) && (
                        <span
                          className="text-sm text-primary"
                          aria-hidden="true"
                        >
                          ✓
                        </span>
                      )}
                    </article>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div
            className="flex gap-4 justify-end"
            role="group"
            aria-label="Member selection actions"
          >
            {onBack && (
              <Button onClick={onBack} aria-label={t("CHAT.BACK")}>
                {t("CHAT.BACK")}
              </Button>
            )}
            <Button
              variant="contained"
              onClick={handleAddMembers}
              disabled={selectedMembers.length === 0 || isAddingMembers}
              aria-label={`${t("CHAT.ADD_MEMBERS")}. ${
                selectedMembers.length
              } ${
                selectedMembers.length === 1 ? "member" : "members"
              } selected.`}
              aria-busy={isAddingMembers}
            >
              {t("CHAT.ADD_MEMBERS")} ({selectedMembers.length})
            </Button>
          </div>
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
          >
            {selectedMembers.length > 0 &&
              `${selectedMembers.length} ${
                selectedMembers.length === 1 ? "member" : "members"
              } selected`}
          </div>
        </section>
      </Modal>
    </>
  );
}
