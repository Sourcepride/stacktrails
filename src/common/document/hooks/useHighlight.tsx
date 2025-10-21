import * as pdfjsLib from "pdfjs-dist";
import { RefObject, useContext, useEffect } from "react";
import { ViewerContext } from "../PDFViewer";

type useHighlightProps = {
  textLayerRef: RefObject<HTMLDivElement | null>;
  page: pdfjsLib.PDFPageProxy;
  viewport: pdfjsLib.PageViewport;
};

// Handle creating highlights on mouse selection
const useHighlight = ({ textLayerRef, page, viewport }: useHighlightProps) => {
  const { tool, addHighlight, scale } = useContext(ViewerContext);
  useEffect(() => {
    if (tool !== "highlight" || !textLayerRef.current) return;

    const overlay = textLayerRef.current;
    let isDrawing = false;
    let startPos = { x: 0, y: 0 };

    const onPointerDown = (e: PointerEvent) => {
      // PREVENT: Don't start highlighting on right-click or middle-click.
      if (e.button !== 0) {
        return;
      }
      isDrawing = true;
      const rect = overlay.getBoundingClientRect();
      startPos = { x: e.clientX - rect.left, y: e.clientY - rect.top };

      // This prevents the default browser text selection behavior while dragging
      e.preventDefault();
    };

    // UPDATED: Renamed from onMouseUp to onPointerUp
    const onPointerUp = async (e: PointerEvent) => {
      if (!isDrawing) return;
      isDrawing = false;

      const rect = overlay.getBoundingClientRect();
      const endPos = { x: e.clientX - rect.left, y: e.clientY - rect.top };

      const selectionRect = {
        x: Math.min(startPos.x, endPos.x),
        y: Math.min(startPos.y, endPos.y),
        width: Math.abs(endPos.x - startPos.x),
        height: Math.abs(endPos.y - startPos.y),
      };

      if (selectionRect.width < 5 || selectionRect.height < 5) return;

      const textContent = await page.getTextContent();
      const quads: Quad[] = [];

      for (const item of textContent.items as any[]) {
        const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
        const w = item.width * scale!;
        const h = item.height * scale!;
        const x = tx[4];
        const y = viewport.height - tx[5] - h; // Adjusted y-coordinate for top-left origin

        // Check for intersection
        if (
          x < selectionRect.x + selectionRect.width &&
          x + w > selectionRect.x &&
          y < selectionRect.y + selectionRect.height &&
          y + h > selectionRect.y
        ) {
          quads.push({
            x: x / scale!,
            y: y / scale!,
            w: w / scale!,
            h: h / scale!,
          });
        }
      }

      if (quads.length > 0) {
        addHighlight({ page: page.pageNumber, quads } as any);
      }
    };

    overlay.addEventListener("pointerdown", onPointerDown);
    overlay.addEventListener("pointerup", onPointerUp);

    return () => {
      overlay.removeEventListener("pointerdown", onPointerDown);
      overlay.removeEventListener("pointerup", onPointerUp);
    };
  }, [tool, page, viewport, scale, addHighlight]);
};

export default useHighlight;
