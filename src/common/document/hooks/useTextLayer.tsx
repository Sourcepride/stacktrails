import * as pdfjsLib from "pdfjs-dist";

import { RefObject, useEffect } from "react";

type useRenderPdfTextProps = {
  textLayerRef: RefObject<HTMLDivElement | null>;
  page: pdfjsLib.PDFPageProxy;
  viewport: pdfjsLib.PageViewport;
};

// Render the text layer for selection
const useRenderTextLayer = ({
  textLayerRef,
  page,
  viewport,
}: useRenderPdfTextProps) => {
  useEffect(() => {
    if (!textLayerRef.current) return;

    let isMounted = true;
    let textLayer: pdfjsLib.TextLayer | null = null;

    const renderTextLayer = async () => {
      if (!textLayerRef.current || !isMounted) return;

      // Clear previous content
      textLayerRef.current.innerHTML = "";

      if (!isMounted) return;

      textLayer = new pdfjsLib.TextLayer({
        textContentSource: page.streamTextContent(),
        viewport,
        container: textLayerRef.current,
      });

      try {
        await textLayer.render();
      } catch (error: any) {
        // Handle RenderingCancelledException gracefully
        if (
          error?.name === "RenderingCancelledException" ||
          error?.message?.includes("Rendering cancelled")
        ) {
          // Silently ignore cancellation - this is expected behavior
          return;
        }
        console.error("Error rendering text layer:", error);
      }
    };

    renderTextLayer();

    return () => {
      isMounted = false;
      // TextLayer doesn't have a cancel method, but we can clear the container
      if (textLayerRef.current) {
        textLayerRef.current.innerHTML = "";
      }
    };
  }, [page, viewport, textLayerRef]);
};

export default useRenderTextLayer;
