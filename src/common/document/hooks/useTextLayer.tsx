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
    textLayerRef.current.innerHTML = "";

    const renderTextLayer = async () => {
      await new pdfjsLib.TextLayer({
        textContentSource: page.streamTextContent(),
        viewport,
        container: textLayerRef.current!,
      }).render();
    };
    renderTextLayer();
  }, [page, viewport]);
};

export default useRenderTextLayer;
