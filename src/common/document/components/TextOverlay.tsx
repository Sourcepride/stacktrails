"use client";

import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/web/pdf_viewer.css";
import { useContext, useRef } from "react";
import { ViewerContext } from "../PDFViewer";
import useHighlight from "../hooks/useHighlight";
import useOverrideContext from "../hooks/useOverrideContext";
import useRenderTextLayer from "../hooks/useTextLayer";
import AnnotationUtils from "./AnnotationUtils";

//--- TextLayer: Renders invisible text and handles highlight creation ---
export default function TextLayer({
  page,
  viewport,
}: {
  page: pdfjsLib.PDFPageProxy;
  viewport: pdfjsLib.PageViewport;
}) {
  const textLayerRef = useRef<HTMLDivElement>(null);
  const { tool } = useContext(ViewerContext);
  useRenderTextLayer({ textLayerRef, page, viewport });
  useHighlight({ textLayerRef, page, viewport });
  const { selectInfo, clearInfo } = useOverrideContext({
    textLayerRef,
    page,
    viewport,
  });

  return (
    <>
      <div
        ref={textLayerRef}
        className="textLayer absolute top-0 left-0 w-full h-full"
        style={{
          cursor: tool === "highlight" ? "crosshair" : "text",
          zIndex: 0, // Ensure text layer is above canvas but below editor layer
        }}
      />
      {selectInfo && (
        <AnnotationUtils
          contextInfo={selectInfo}
          onClose={clearInfo}
          page={page.pageNumber}
          viewPort={viewport}
        />
      )}
    </>
  );
}
