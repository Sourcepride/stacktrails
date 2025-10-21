"use client";

import { getImageProxyUrl } from "@/lib/utils";
import { useAppStore } from "@/store";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/web/pdf_viewer.css";
import React, { createContext, useEffect, useRef, useState } from "react";
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

  // NEW: Store the observer instance in a ref
  const observer = useRef<IntersectionObserver | null>(null);

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
      } catch (error) {
        console.error("Failed to load PDF:", error);
      }
    };
    loadPdf();
  }, [url]);

  usePageIntersection({ containerRef, observer, setViewerState });
  useFetchAnnotations({ docId, setState: setViewerState as any });
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
            Array.from({ length: viewerState.pageCount }, (_, i) => (
              <PdfPage
                key={i + 1}
                pageNum={i + 1}
                containerRef={containerRef as any}
                observer={observer.current}
              />
            ))}
        </div>
      </div>
    </ViewerContext.Provider>
  );
}
