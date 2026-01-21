import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/web/pdf_viewer.css";
import { useEffect, useRef } from "react";

//--- CanvasLayer: Renders the core PDF content ---
export default function CanvasLayer({
  page,
  viewport,
}: {
  page: pdfjsLib.PDFPageProxy;
  viewport: pdfjsLib.PageViewport;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTask = useRef<pdfjsLib.RenderTask | null>(null);

  useEffect(() => {
    let isMounted = true;

    const renderPage = async () => {
      if (!isMounted) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const outputScale = window.devicePixelRatio || 1;

      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;

      const transform =
        outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;

      // Cancel any existing render task
      if (renderTask.current) {
        renderTask.current.cancel();
        renderTask.current = null;
      }

      if (!isMounted) return;

      renderTask.current = page.render({
        canvasContext: ctx,
        viewport,
        transform,
        canvas,
      });

      try {
        await renderTask.current.promise;
      } catch (error: any) {
        // Handle RenderingCancelledException gracefully
        // This is expected when the component unmounts or page changes
        if (
          error?.name === "RenderingCancelledException" ||
          error?.message?.includes("Rendering cancelled")
        ) {
          // Silently ignore cancellation - this is expected behavior
          return;
        }
        // Re-throw other errors
        throw error;
      } finally {
        if (isMounted) {
          renderTask.current = null;
        }
      }
    };

    renderPage();

    return () => {
      isMounted = false;
      if (renderTask.current) {
        renderTask.current.cancel();
        renderTask.current = null;
      }
    };
  }, [page, viewport]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full m-0"
    />
  );
}
