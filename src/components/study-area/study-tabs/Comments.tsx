"use client";

import Comment from "@/common/comment/Comment";
import CreateComment from "@/common/comment/CreateComment";
import LoadingComponent from "@/common/utils/LoadingComponent";
import { cacheKeys } from "@/lib/cacheKeys";
import { getCourseComments } from "@/lib/http/commentFunc";
import { Button } from "@mui/material";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

type CommentsProps = {
  courseId: string;
  showHeader?: boolean;
};

const Comments: React.FC<CommentsProps> = ({ courseId, showHeader }) => {
  const t = useTranslations("COMMENTS_RATING");

  const {
    data: commentData,
    fetchNextPage: fetchNextCommentPage,
    hasNextPage: hasNextCommentPage,
    isFetchingNextPage: isFetchingNextCommentPage,
  } = useSuspenseInfiniteQuery({
    queryKey: [cacheKeys.COURSE_COMMENT, courseId],
    queryFn: getCourseComments({ courseId }),
    getNextPageParam: (lastPage) => {
      return lastPage.has_next ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
  });

  return (
    <section className="w-full">
      {showHeader && (
        <h2 className="text-2xl font-bold mb-4">{t("COMMUNITY_COMMENTS")}</h2>
      )}
      <CreateComment courseId={courseId} />
      <LoadingComponent loading={false} empty={commentData.pages[0].total < 1}>
        <div className="w-full space-y-4">
          {commentData.pages.map((page, i) => (
            <div key={"page_comment__" + i} className="">
              {page.items.map((comment: CourseComment) => (
                <Comment key={comment.id} data={comment} />
              ))}
            </div>
          ))}

          {hasNextCommentPage && (
            <div className="flex justify-center pt-4">
              <Button
                onClick={() => fetchNextCommentPage()}
                disabled={isFetchingNextCommentPage}
                variant="outlined"
              >
                {isFetchingNextCommentPage
                  ? `${t("LOADING_COMMENTS")}...`
                  : t("LOAD_MORE_COMMENT")}
              </Button>
            </div>
          )}
        </div>
      </LoadingComponent>
    </section>
  );
};

export default Comments;
