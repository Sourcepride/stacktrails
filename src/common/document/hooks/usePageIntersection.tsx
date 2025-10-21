import { RefObject, useEffect } from "react";

type usePageIntersectionProps = {
  containerRef: RefObject<HTMLDivElement | null>;
  observer: RefObject<IntersectionObserver | null>;
  setViewerState: React.Dispatch<React.SetStateAction<any>>;
};
const usePageIntersection = ({
  containerRef,
  observer,
  setViewerState,
}: usePageIntersectionProps) => {
  useEffect(() => {
    if (!containerRef.current) return;

    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Get the page number from the data attribute

            const pageNum = entry.target.getAttribute("data-page-index");
            if (pageNum) {
              setViewerState((s: any) => ({
                ...s,
                currentPage: parseInt(pageNum, 10),
              }));
            }
          }
        });
      },
      {
        root: containerRef.current, // The scrollable container
        threshold: 0.3, // 50% of the page must be visible
        // rootMargin: `-40px 0px 0px 0px`,
      }
    );

    // Cleanup function to disconnect the observer
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []); // Run this effect only once
};

export default usePageIntersection;
