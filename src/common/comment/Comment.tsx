"use client";

import { Link } from "@/i18n/navigation";
import { appToast } from "@/lib/appToast";
import { cacheKeys } from "@/lib/cacheKeys";
import { getCommentReplies, likeUnlike } from "@/lib/http/commentFunc";
import { timeAgo } from "@/lib/utils";
import { PublicRoutes } from "@/routes";
import { Avatar, Button, CircularProgress, IconButton } from "@mui/material";
import { BsHandThumbsUp } from "@react-icons/all-files/bs/BsHandThumbsUp";
import { BsHandThumbsUpFill } from "@react-icons/all-files/bs/BsHandThumbsUpFill";
import { FaAngleDown } from "@react-icons/all-files/fa/FaAngleDown";
import { FaAngleUp } from "@react-icons/all-files/fa/FaAngleUp";
import { FaRegCommentDots } from "@react-icons/all-files/fa/FaRegCommentDots";
import {
  useMutation,
  useQueryClient,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Suspense, useState } from "react";
import CreateComment from "./CreateComment";

type CommentProps = {
  data: CourseComment;
};

const CommentMain: React.FC<CommentProps> = ({ data }) => {
  const t = useTranslations();
  const queryClient = useQueryClient();

  const [liked, setLiked] = useState(!!data.is_liked);
  const [likeCount, setLikeCount] = useState(data.likes);
  const [showCreate, setShowCreate] = useState(false);

  const { mutate } = useMutation({
    mutationFn: likeUnlike,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [cacheKeys.COMMENT_REPLIES, data.id],
      });
      queryClient.invalidateQueries({
        queryKey: [cacheKeys.COURSE_COMMENT, data.course_id],
      });
    },
    onError: () => {
      setLiked(!!data.is_liked);
      setLikeCount(data.likes);
      appToast.Error(t("EXCEPTIONS.PLEASE_TRY_AGAIN"));
    },
  });

  const handleLike = () => {
    setLiked(!data.is_liked);
    setLikeCount(data.is_liked ? data.likes - 1 : data.likes + 1);
    mutate({ comment_id: data.id });
  };

  return (
    <div className="flex  gap-3 py-4  w-full">
      <Avatar
        src={data?.account?.profile?.avatar}
        alt={data?.account?.username}
        sx={{
          width: 40,
          height: 40,
          background: (theme) => theme.palette.primary.main,
        }}
      >
        {data?.account?.username?.substring(0, 2)?.toUpperCase()}
      </Avatar>
      <div className="flex-1 grow">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-gray-900 text-sm">
            {data?.account?.username}
          </span>
          <span className="text-xs text-gray-500">
            {timeAgo(data.created_at)}
          </span>
        </div>
        <div className="text-gray-800 text-sm font-light mb-2 whitespace-pre-line">
          {data.mention?.username && (
            <small className="text-[#1e90ff]">
              <Link href={PublicRoutes.getAuthor(data.mention.username)}>
                @{data.mention.username}
              </Link>
            </small>
          )}{" "}
          {data.message}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <IconButton
            size="small"
            onClick={handleLike}
            aria-label="Like"
            className="!p-1"
          >
            {liked ? (
              <BsHandThumbsUpFill color="primary" />
            ) : (
              <BsHandThumbsUp />
            )}
          </IconButton>
          <span className="text-xs text-gray-600">{likeCount}</span>
          <button
            onClick={() => setShowCreate(true)}
            type="button"
            className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600 font-medium ml-2"
          >
            <FaRegCommentDots className="w-4 h-4" /> {t("COMMENT.REPLY")}
          </button>
        </div>

        {showCreate && (
          <div className="w-full">
            <CreateComment
              courseId={data.course_id}
              replyToId={data.id}
              cancel={() => setShowCreate(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const Comment: React.FC<CommentProps> = (props) => {
  const [showReplies, setShowReplies] = useState(false);

  const { data } = props;
  return (
    <div className="w-full">
      <CommentMain {...props} />
      {data.comment_count > 0 && (
        <div className="pl-16">
          <button
            type="button"
            className="flex items-center gap-1 text-primary"
            onClick={() => setShowReplies(!showReplies)}
          >
            <span>{showReplies ? <FaAngleUp /> : <FaAngleDown />} </span>
            {data.comment_count} replies
          </button>
        </div>
      )}

      {showReplies && (
        <Suspense
          fallback={
            <div className="w-full grid place-items-center">
              {" "}
              <CircularProgress />
            </div>
          }
        >
          <CommentReplies commentId={data.id} />
        </Suspense>
      )}
    </div>
  );
};

export default Comment;

function CommentReplies({ commentId }: { commentId: string }) {
  const t = useTranslations("COMMENTS_RATING");
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery({
      queryKey: [cacheKeys.COMMENT_REPLIES, commentId],
      queryFn: getCommentReplies({ commentId }),
      getNextPageParam: (lastPage) => {
        return lastPage.has_next ? lastPage.page + 1 : undefined;
      },
      initialPageParam: 1,
    });

  return (
    <div className="space-y-4 pl-16">
      {data.pages.map((page, i) => (
        <div key={"page_replies__" + i + commentId} className="">
          {page.items.map((comment) => (
            <CommentMain key={comment.id} data={comment} />
          ))}
        </div>
      ))}

      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            variant="outlined"
          >
            {isFetchingNextPage
              ? `${t("LOADING_COMMENTS")}...`
              : t("LOAD_MORE_COMMENT")}
          </Button>
        </div>
      )}
    </div>
  );
}
