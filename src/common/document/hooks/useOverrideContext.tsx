import * as pdfjsLib from "pdfjs-dist";
import { RefObject, useEffect, useState } from "react";

type useOverrideContextProps = {
  textLayerRef: RefObject<HTMLDivElement | null>;
  page: pdfjsLib.PDFPageProxy;
  viewport: pdfjsLib.PageViewport;
};

const useOverrideContext = ({
  textLayerRef,
  page,
  viewport,
}: useOverrideContextProps): {
  selectInfo: ContextInfo | undefined;
  clearInfo: () => void;
} => {
  const [selectInfo, setSelectInfo] = useState<ContextInfo | undefined>();

  useEffect(() => {
    if (!textLayerRef.current) return;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();

      const boundingRef = textLayerRef.current?.getBoundingClientRect();

      const xPosition = e.clientX - (boundingRef?.left || 0);
      const yPosition = e.clientY - (boundingRef?.top || 0);

      const [pdfX, pdfY] = viewport.convertToPdfPoint(xPosition, yPosition);

      // console.log(pdfX, pdfY, xPosition, yPosition);

      const selection = window.getSelection();

      let text;

      if (selection && selection.rangeCount > 0) {
        text = selection.toString();
      }

      const [screenX, screenY] = viewport.convertToViewportPoint(pdfX, pdfY);

      setSelectInfo({
        text,
        pdfCoord: { x: pdfX, y: pdfY },
        screenCoord: { x: screenX, y: screenY },
      });
    };

    textLayerRef.current.addEventListener("contextmenu", handleContextMenu);

    return () => {
      textLayerRef.current?.removeEventListener(
        "contextmenu",
        handleContextMenu
      );
    };
  }, [page, viewport]);

  return {
    selectInfo,
    clearInfo: () => setSelectInfo(undefined),
  };
};

export default useOverrideContext;
