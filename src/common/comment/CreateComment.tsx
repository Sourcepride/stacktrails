"use client";

import { appToast } from "@/lib/appToast";
import { cacheKeys } from "@/lib/cacheKeys";
import { createCommentFn } from "@/lib/http/commentFunc";
import { useAppStore } from "@/store";
import { Avatar, Button, TextField } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";

type CreateCommentProps = {
  courseId: string;
  replyToId?: string;
  rootParentId?: string;
  onSubmit?: (text: string) => void;
  cancel?: () => void;
};

const CreateComment: React.FC<CreateCommentProps> = ({
  courseId,
  replyToId,
  rootParentId,
  cancel,
}) => {
  const t = useTranslations();
  const { user } = useAppStore((s) => s);
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: createCommentFn,
    onSuccess: () => {
      setText("");
      setSubmitting(false);

      if (replyToId) {
        // Invalidate replies for the immediate parent
        queryClient.invalidateQueries({
          queryKey: [cacheKeys.COMMENT_REPLIES, replyToId],
        });

        // If this is a nested reply (replying to a reply), also invalidate
        // the root parent's replies query to ensure the nested reply appears
        // in the root parent's replies list
        if (rootParentId && rootParentId !== replyToId) {
          queryClient.invalidateQueries({
            queryKey: [cacheKeys.COMMENT_REPLIES, rootParentId],
          });
        }
      }

      queryClient.invalidateQueries({
        queryKey: [cacheKeys.COURSE_COMMENT, courseId],
      });

      // Close the reply input box automatically after successful reply creation
      if (replyToId && cancel) {
        cancel();
      }
    },
    onError: () => {
      setSubmitting(false);
      appToast.Error(t("COMMENT.COMMENT_CREATION_FAILED"));
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return appToast.Info(t("COMMENT.SIGN_IN_TO_COMMENT"));
    if (!text.trim()) return;
    setSubmitting(true);
    mutate({
      course_id: courseId,
      message: text.trim(),
      reply_to_id: replyToId,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 py-4 items-start">
      <Avatar
        src={user?.profile.avatar}
        alt={user?.username}
        sx={{ width: 40, height: 40 }}
      >
        {user?.username.substring(0, 2).toUpperCase()}
      </Avatar>
      <div className="flex-1">
        <TextField
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("COMMENT.ADD_COMMENT")}
          multiline
          minRows={2}
          maxRows={6}
          fullWidth
          variant="outlined"
          size="small"
          sx={{ mb: 1 }}
        />
        <div className="flex gap-2 justify-end">
          {cancel && (
            <Button
              type="button"
              variant="outlined"
              size="small"
              sx={{ borderRadius: 8, textTransform: "none", fontWeight: 500 }}
              onClick={cancel}
            >
              {t("CANCEL")}
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            size="small"
            disabled={!text.trim() || submitting || isPending}
            sx={{ borderRadius: 8, textTransform: "none", fontWeight: 500 }}
          >
            {t("COMMENT.COMMENT")}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default CreateComment;
