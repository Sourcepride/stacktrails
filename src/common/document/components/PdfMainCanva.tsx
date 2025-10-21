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
    const renderPage = async () => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      const outputScale = window.devicePixelRatio || 1;

      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;

      const transform =
        outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;

      if (renderTask.current) renderTask.current.cancel();

      renderTask.current = page.render({
        canvasContext: ctx,
        viewport,
        transform,
        canvas,
      });

      await renderTask.current.promise;
    };

    renderPage();

    return () => {
      if (renderTask.current) {
        renderTask.current.cancel();
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
