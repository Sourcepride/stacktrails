"use client";

import { getImageProxyUrl } from "@/lib/utils";
import { useAppStore } from "@/store";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/web/pdf_viewer.css";
import React, {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import PdfPage from "./PDFPage";
import PDFControls from "./components/PDFControl";
import useAnnotationSync from "./hooks/useAnnotationSync";
import useFetchAnnotations from "./hooks/useFetchAnnotations";
import usePageIntersection from "./hooks/usePageIntersection";

// --- PDF.js WORKER SETUP ---
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";

// --- STATE AND CONTEXT DEFINITION ---
const initialState = {
  pdfDoc: undefined as pdfjsLib.PDFDocumentProxy | undefined,
  pageCount: 0,
  scale: null as number | null,
  tool: "select" as Tool,
  highlights: [] as Highlight[],
  currentPage: 1, // Start at page 1
  annotations: [] as PdfCustomAnnotation[],
  showAnnotations: true,
};

type ViewerContextType = typeof initialState & {
  setState: React.Dispatch<React.SetStateAction<typeof initialState>>;
  addHighlight: (highlight: Omit<Highlight, "id">) => void;
  deleteHighlight: (id: string) => void;
  addNote: (data: Omit<PdfCustomAnnotation, "id"> & { id?: string }) => void;
  deleteNote: (id: string) => void;
  updateNote: (data: PdfCustomAnnotation) => void;
};

export const ViewerContext = createContext<ViewerContextType>(null as any);

type params = {
  url: string;
  docId?: string;
};

// --- MAIN VIEWER COMPONENT ---
export default function PdfViewer({ url, docId }: params) {
  const { user } = useAppStore((store) => store);
  const [viewerState, setViewerState] = useState(initialState);
  const containerRef = useRef<HTMLDivElement>(null);

  // Track which pages are loaded
  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set());
  const loadedPagesRef = useRef<Set<number>>(new Set()); // Ref to track loaded pages for scroll handler
  const loadingPagesRef = useRef<Set<number>>(new Set()); // Track pages currently being loaded

  // NEW: Store the observer instance in a ref
  const observer = useRef<IntersectionObserver | null>(null);

  // Batch size for loading pages
  const BATCH_SIZE = 20;

  // Sync ref with state
  useEffect(() => {
    loadedPagesRef.current = loadedPages;
  }, [loadedPages]);

  // Function to load a range of pages
  const loadPageRange = useCallback(
    (startPage: number, endPage: number) => {
      if (!viewerState.pdfDoc) return;

      setLoadedPages((prev) => {
        const pagesToLoad: number[] = [];
        for (let i = startPage; i <= endPage; i++) {
          if (i >= 1 && i <= viewerState.pageCount) {
            // Only load if not already loaded and not currently loading
            if (!prev.has(i) && !loadingPagesRef.current.has(i)) {
              pagesToLoad.push(i);
              loadingPagesRef.current.add(i);
            }
          }
        }

        if (pagesToLoad.length > 0) {
          const newSet = new Set(prev);
          pagesToLoad.forEach((pageNum) => newSet.add(pageNum));

          // Remove from loading set after a short delay (pages will be rendered)
          setTimeout(() => {
            pagesToLoad.forEach((pageNum) => {
              loadingPagesRef.current.delete(pageNum);
            });
          }, 100);

          return newSet;
        }

        return prev;
      });
    },
    [viewerState.pdfDoc, viewerState.pageCount]
  );

  // Load the PDF document
  useEffect(() => {
    const loadPdf = async () => {
      try {
        const doc = await pdfjsLib.getDocument(getImageProxyUrl(url)).promise;
        setViewerState((s) => ({
          ...s,
          pdfDoc: doc,
          pageCount: doc.numPages,
        }));

        // Load initial batch of pages (first 20)
        const initialEnd = Math.min(20, doc.numPages);
        setLoadedPages(new Set(Array.from({ length: initialEnd }, (_, i) => i + 1)));
      } catch (error) {
        console.error("Failed to load PDF:", error);
      }
    };
    loadPdf();
  }, [url]);

  usePageIntersection({ containerRef, observer, setViewerState });
  useFetchAnnotations({ docId, setState: setViewerState as any });

  // Handle scroll to load more pages
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !viewerState.pdfDoc) return;

    let scrollTimeout: NodeJS.Timeout | null = null;

    const handleScroll = () => {
      // Debounce scroll handler
      if (scrollTimeout) clearTimeout(scrollTimeout);

      scrollTimeout = setTimeout(() => {
        const currentLoadedPages = loadedPagesRef.current;
        const loadedPagesArray = Array.from(currentLoadedPages);
        if (loadedPagesArray.length === 0) return;

        const lastLoadedPage = Math.max(...loadedPagesArray);
        const firstLoadedPage = Math.min(...loadedPagesArray);

        // Check if any page elements are visible to determine current position
        const pageElements = container.querySelectorAll('[data-page-index]');
        let visiblePageNumbers: number[] = [];

        pageElements.forEach((el) => {
          const rect = el.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          
          // Check if page is visible in viewport
          if (
            rect.top < containerRect.bottom &&
            rect.bottom > containerRect.top
          ) {
            const pageNum = parseInt(el.getAttribute('data-page-index') || '0', 10);
            if (pageNum > 0) {
              visiblePageNumbers.push(pageNum);
            }
          }
        });

        if (visiblePageNumbers.length === 0) return;

        const maxVisiblePage = Math.max(...visiblePageNumbers);
        const minVisiblePage = Math.min(...visiblePageNumbers);

        // Load next batch when user scrolls to the 10th page (or near the end of loaded pages)
        // Trigger when user is within 5 pages of the last loaded page
        if (maxVisiblePage >= lastLoadedPage - 5 && lastLoadedPage < viewerState.pageCount) {
          const nextBatchStart = lastLoadedPage + 1;
          const nextBatchEnd = Math.min(
            nextBatchStart + BATCH_SIZE - 1,
            viewerState.pageCount
          );
          loadPageRange(nextBatchStart, nextBatchEnd);
        }

        // Load previous batch when user scrolls near the first loaded page
        if (minVisiblePage <= firstLoadedPage + 5 && firstLoadedPage > 1) {
          const prevBatchEnd = firstLoadedPage - 1;
          const prevBatchStart = Math.max(1, prevBatchEnd - BATCH_SIZE + 1);
          loadPageRange(prevBatchStart, prevBatchEnd);
        }
      }, 150); // Debounce scroll events
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [viewerState.pdfDoc, viewerState.pageCount, loadPageRange]);

  // Handle page navigation - load pages around target if not loaded
  useEffect(() => {
    if (!viewerState.pdfDoc || !viewerState.currentPage) return;

    const targetPage = viewerState.currentPage;
    const currentLoadedPages = loadedPagesRef.current;

    // If target page is not loaded, load pages around it
    if (!currentLoadedPages.has(targetPage)) {
      const startPage = Math.max(1, targetPage - Math.floor(BATCH_SIZE / 2));
      const endPage = Math.min(
        viewerState.pageCount,
        targetPage + Math.floor(BATCH_SIZE / 2)
      );
      loadPageRange(startPage, endPage);
    }
  }, [viewerState.currentPage, viewerState.pdfDoc, viewerState.pageCount, loadPageRange]);
  const { createAnnotation, deleteAnnotation, updateAnnotation } =
    useAnnotationSync({
      docId,
      onCreate: (data: AnnotationResp) => {
        if (data.type === "highlight") {
          setViewerState((s) => ({
            ...s,
            highlights: [
              ...s.highlights,
              {
                id: data.id,
                page: data.page_number || 1,
                quads: Array.isArray((data?.meta_data as any)?.quads)
                  ? (data?.meta_data as any)?.quads
                  : [],
              } as any,
            ],
          }));
          return;
        }

        setViewerState((s) => ({
          ...s,
          annotations: [
            ...s.annotations,
            {
              id: data.id,
              page: data.page_number || 1,
              point: (data.meta_data as any)?.point ?? { x: 0, y: 0 },
              text: data.content,
              type: "note",
            } as any,
          ],
        }));
      },
      onDelete: (data: AnnotationResp) => {
        if (data.type === "highlight") {
          setViewerState((s) => ({
            ...s,
            highlights: s.highlights.filter((h) => h.id !== data.id),
          }));
          return;
        }

        setViewerState((s) => ({
          ...s,
          annotations: s.annotations.filter((h) => h.id !== data.id),
        }));
      },
      onUpdate: (data: AnnotationResp) => {
        if (data.type === "highlight") {
          return;
        }

        setViewerState((s) => ({
          ...s,
          annotations: s.annotations.map((annotation) => {
            if (annotation.id !== data.id) return annotation;
            return {
              ...annotation,
              ...({
                id: data.id,
                page: data.page_number || 1,
                point: (data.meta_data as any)?.point ?? { x: 0, y: 0 },
                text: data.content,
                type: "note",
              } as any),
            };
          }),
        }));
      },
      syncAnnotation: !!docId,
    });

  // Function to add a new highlight
  const addHighlight = (highlight: Omit<Highlight, "id">) => {
    createAnnotation({
      page_number: highlight.page,
      meta_data: {
        quads: highlight.quads,
      },
      type: "highlight",
    });
  };

  // Function to delete a highlight
  const deleteHighlight = (id: string) => {
    deleteAnnotation(id);
  };

  const addNote = (data: Omit<PdfCustomAnnotation, "id"> & { id?: string }) => {
    createAnnotation({
      page_number: data.page,
      content: data.text,
      meta_data: {
        point: data.point,
      },
      type: "note",
    });
  };
  const deleteNote = (id: string) => {
    deleteAnnotation(id);
  };
  const updateNote = (data: PdfCustomAnnotation) => {
    updateAnnotation({
      id: data.id,
      page_number: data.page,
      content: data.text,
      meta_data: {
        point: data.point,
      },
      type: "note",
    });
  };

  return (
    <ViewerContext.Provider
      value={{
        ...viewerState,
        setState: setViewerState,
        addHighlight,
        deleteHighlight,
        addNote,
        deleteNote,
        updateNote,
      }}
    >
      <div className="w-full pt-10 relative h-full flex flex-col items-center bg-[#242323]">
        <PDFControls />
        <div
          id="pdf-container"
          ref={containerRef}
          className="relative w-full max-w-[800px] overflow-y-auto h-full m-auto"
        >
          {viewerState.pdfDoc &&
            Array.from({ length: viewerState.pageCount }, (_, i) => {
              const pageNum = i + 1;
              const isLoaded = loadedPages.has(pageNum);

              // Render actual page if loaded, otherwise render placeholder
              if (isLoaded) {
                return (
                  <PdfPage
                    key={pageNum}
                    pageNum={pageNum}
                    containerRef={containerRef as any}
                    observer={observer.current}
                  />
                );
              } else {
                // Placeholder to maintain scroll height
                return (
                  <div
                    key={pageNum}
                    data-page-index={pageNum}
                    className="m-2 bg-gray-700 animate-pulse"
                    style={{
                      height: 1100,
                      width: 800,
                      margin: "8px auto",
                    }}
                  />
                );
              }
            })}
        </div>
      </div>
    </ViewerContext.Provider>
  );
}
