"use client";

import StarRating from "@/components/courses/Stars";
import { appToast } from "@/lib/appToast";
import { cacheKeys } from "@/lib/cacheKeys";
import { createReviewFn } from "@/lib/http/commentFunc";

import { useAppStore } from "@/store";
import { Avatar, Button, TextField } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";

type CreateReviewProps = {
  courseId: string;

  cancel?: () => void;
};

const CreateReview: React.FC<CreateReviewProps> = ({
  courseId,

  cancel,
}) => {
  const t = useTranslations();
  const { user } = useAppStore((s) => s);
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const [stars, setStars] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: createReviewFn,
    onSuccess: () => {
      setText("");
      setSubmitting(false);
      setStars(0);

      queryClient.invalidateQueries({
        queryKey: [cacheKeys.COURSE_REVIEW, courseId],
      });
      queryClient.invalidateQueries({
        queryKey: [cacheKeys.COURSE_COMMENT, courseId],
      });
    },
    onError: () => {
      setSubmitting(false);
      appToast.Error(t("COMMENTS_RATING.CREATION_FAILED"));
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return appToast.Info(t("COMMENTS_RATING.SIGN_IN"));
    if (stars === 0) return appToast.Info("stars must be greater than zero");
    if (!text.trim()) return;
    setSubmitting(true);
    mutate({
      course_id: courseId,
      message: text.trim(),
      star: stars,
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
        <div className="mb-3">
          <StarRating
            rating={stars}
            editable
            onRatingChange={(rating) => setStars(rating)}
            size="large"
          />
        </div>
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
            disabled={!text.trim() || submitting || isPending || !stars}
            sx={{ borderRadius: 8, textTransform: "none", fontWeight: 500 }}
          >
            {t("COMMENT.COMMENT")}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default CreateReview;
