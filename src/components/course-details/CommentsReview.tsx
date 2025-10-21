"use client";

import Comment from "@/common/comment/Comment";
import CreateComment from "@/common/comment/CreateComment";
import CreateReview from "@/common/comment/CreateReview";
import ReviewComponent from "@/common/comment/ReviewComponent";
import LoadingComponent from "@/common/utils/LoadingComponent";
import { cacheKeys } from "@/lib/cacheKeys";
import { getCourseComments, getCourseReviews } from "@/lib/http/commentFunc";
import { Button } from "@mui/material";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import * as React from "react";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  hideContent?: boolean;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, hideContent, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {!hideContent && value === index && (
        <Box sx={{ p: 3, width: "100%" }}>{children}</Box>
      )}
      {hideContent && (
        <Box
          sx={{
            p: 3,
            display: value === index ? "block" : "none",
            width: "100%",
          }}
        >
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

type CommentsReviewProps = {
  courseId: string;
};
const CommentsReview: React.FC<CommentsReviewProps> = ({ courseId }) => {
  const t = useTranslations("COMMENTS_RATING");
  const [value, setValue] = React.useState(0);

  const {
    data: reviewData,
    fetchNextPage: fetchNextReviewPage,
    hasNextPage: hasNextReviewPage,
    isFetchingNextPage: isFetchingNextReviewPage,
  } = useSuspenseInfiniteQuery({
    queryKey: [cacheKeys.COURSE_REVIEW, courseId],
    queryFn: getCourseReviews({ courseId }),
    getNextPageParam: (lastPage) => {
      return lastPage.has_next ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
  });

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

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <section className="w-full">
      <h2 className="text-2xl font-bold mb-4">{t("HEADER_TEXT")}</h2>
      <Box sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label={t("HEADER_TEXT")}
          >
            <Tab label={t("REVIEWS_AND_RATING")} {...a11yProps(0)} />
            <Tab label={t("COMMUNITY_COMMENTS")} {...a11yProps(1)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0} hideContent>
          <CreateReview courseId={courseId} />
          <LoadingComponent
            loading={false}
            empty={reviewData.pages[0].total < 1}
          >
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
                    disabled={isFetchingNextReviewPage}
                    variant="outlined"
                  >
                    {isFetchingNextReviewPage
                      ? `${t("LOADING_REVIEWS")}...`
                      : t("LOAD_MORE_REVIEWS")}
                  </Button>
                </div>
              )}
            </div>
          </LoadingComponent>
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          <CreateComment courseId={courseId} />
          <LoadingComponent
            loading={false}
            empty={commentData.pages[0].total < 1}
          >
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
        </CustomTabPanel>
      </Box>
    </section>
  );
};

export default CommentsReview;
