import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/web/pdf_viewer.css";
import { RefObject, useContext, useEffect, useRef, useState } from "react";
import { ViewerContext } from "./PDFViewer";
import AnnotationDisplayLayer from "./components/AnnotationDisplayLayer";
import AnnotationEditorLayer from "./components/AnnotationEditorLayer";
import HighlightLayer from "./components/Highlight";
import CanvasLayer from "./components/PdfMainCanva";
import TextLayer from "./components/TextOverlay";

export default function PdfPage({
  pageNum,
  containerRef,
  observer,
}: {
  pageNum: number;
  containerRef: RefObject<HTMLDivElement>;
  observer: IntersectionObserver | null;
}) {
  const { pdfDoc, scale, setState } = useContext(ViewerContext);
  const [page, setPage] = useState<pdfjsLib.PDFPageProxy | null>(null);
  const [viewport, setViewport] = useState<pdfjsLib.PageViewport | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentPageRef = pageRef.current;

    if (currentPageRef && observer) {
      // Start observing the page
      observer.observe(currentPageRef);
    }

    // Cleanup function: stop observing when the component unmounts
    return () => {
      if (currentPageRef && observer) {
        observer.unobserve(currentPageRef);
      }
    };
  }, [observer, page]);

  useEffect(() => {
    if (!pdfDoc) return;

    let isMounted = true;

    const fetchPage = async () => {
      try {
        const pdfPage = await pdfDoc.getPage(pageNum);

        if (!isMounted) return;

        setPage(pdfPage);

        // Initialize scale if not set
        let effectiveScale = scale;
        if (effectiveScale === null) {
          const containerWidth = containerRef.current?.clientWidth || 800;
          const unscaledVp = pdfPage.getViewport({ scale: 1 });

          effectiveScale = containerWidth / unscaledVp.width;
          // Set scale globally only once from the first page
          if (pageNum === 1 && isMounted) {
            setState((s) => ({ ...s, scale: effectiveScale }));
          }
        }

        if (!isMounted) return;

        const vp = pdfPage.getViewport({ scale: effectiveScale! });
        setViewport(vp);
      } catch (error: any) {
        // Handle errors gracefully
        if (
          error?.name === "RenderingCancelledException" ||
          error?.message?.includes("Rendering cancelled")
        ) {
          // Silently ignore cancellation
          return;
        }
        console.error("Error fetching PDF page:", error);
      }
    };

    fetchPage();

    return () => {
      isMounted = false;
    };
  }, [pdfDoc, pageNum, scale, setState, containerRef]);

  if (!page || !viewport) {
    // A simple loading placeholder
    return (
      <div
        className="m-2 bg-gray-700 animate-pulse"
        style={{ height: 1100, width: 800 }}
      ></div>
    );
  }

  // This is the REGION div
  return (
    <div
      className="page-custom relative mb-1 shadow-lg bg-white "
      style={{
        width: `${viewport.width}px`,
        height: `${viewport.height}px`,
      }}
      data-page-index={pageNum}
      ref={pageRef}
    >
      {/* 1. CANVAS WRAPPER */}
      <div className="canvasWrapper w-full h-full overflow-hidden">
        <CanvasLayer page={page} viewport={viewport} />
        {/* SVG highlights are siblings to the canvas */}

        <HighlightLayer pageNum={pageNum} />
      </div>

      {/* 2. TEXT LAYER */}
      <TextLayer page={page} viewport={viewport} />

      <AnnotationDisplayLayer pageNum={pageNum} viewport={viewport} />

      {/* 4. ANNOTATION EDIT LAYER */}
      <AnnotationEditorLayer pageNum={pageNum} />
    </div>
  );
}
