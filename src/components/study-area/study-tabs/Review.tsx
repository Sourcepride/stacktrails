"use client";

import CreateReview from "@/common/comment/CreateReview";
import ReviewComponent from "@/common/comment/ReviewComponent";
import LoadingComponent from "@/common/utils/LoadingComponent";
import { cacheKeys } from "@/lib/cacheKeys";
import { getCourseReviews } from "@/lib/http/commentFunc";
import { Button } from "@mui/material";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

type ReviewProps = {
  courseId: string;
  showHeader?: boolean;
};

const Review: React.FC<ReviewProps> = ({ courseId, showHeader }) => {
  const t = useTranslations("COMMENTS_RATING");

  const {
    data: reviewData,
    fetchNextPage: fetchNextReviewPage,
    hasNextPage: hasNextReviewPage,
    isFetchingNextPage: isFetchingNextPage,
  } = useSuspenseInfiniteQuery({
    queryKey: [cacheKeys.COURSE_REVIEW, courseId],
    queryFn: getCourseReviews({ courseId }),
    getNextPageParam: (lastPage) => {
      return lastPage.has_next ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
  });

  return (
    <section className="w-full">
      {showHeader && (
        <h2 className="text-2xl font-bold mb-4">{t("REVIEWS_AND_RATING")}</h2>
      )}
      <CreateReview courseId={courseId} />
      <LoadingComponent loading={false} empty={reviewData.pages[0].total < 1}>
        <div className="w-full space-y-4">
          {reviewData.pages.map((page, i) => (
            <div key={"page_review__" + i} className="">
              {page.items.map((review: CourseReview) => (
                <ReviewComponent key={review.id} data={review} />
              ))}
            </div>
          ))}

          {hasNextReviewPage && (
            <div className="flex justify-center pt-4">
              <Button
                onClick={() => fetchNextReviewPage()}
                disabled={isFetchingNextPage}
                variant="outlined"
              >
                {isFetchingNextPage
                  ? `${t("LOADING_REVIEWS")}...`
                  : t("LOAD_MORE_REVIEWS")}
              </Button>
            </div>
          )}
        </div>
      </LoadingComponent>
    </section>
  );
};

export default Review;
