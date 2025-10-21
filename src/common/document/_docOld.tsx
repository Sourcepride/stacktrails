"use client";
import { getImageProxyUrl } from "@/lib/utils";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/web/pdf_viewer.css";

import { FaAngleLeft } from "@react-icons/all-files/fa/FaAngleLeft";
import { FaAngleRight } from "@react-icons/all-files/fa/FaAngleRight";
import { FaCopy } from "@react-icons/all-files/fa/FaCopy";
import { FaSearchMinus } from "@react-icons/all-files/fa/FaSearchMinus";
import { FaSearchPlus } from "@react-icons/all-files/fa/FaSearchPlus";
import { FaHighlighter } from "@react-icons/all-files/fa6/FaHighlighter";
import { FaRegCommentDots } from "@react-icons/all-files/fa6/FaRegCommentDots";
import {
  createContext,
  RefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";

type Tool = "select" | "highlight" | "comment" | "copy";

interface Quad {
  x: number;
  y: number;
  w: number;
  h: number;
}
interface Highlight {
  id: string;
  page: number;
  quads: Quad[];
  comment?: string;
}
interface PdfViewerProps {
  url: string;
}

const initialState = {
  pageCount: 0,
  pdfDoc: undefined as pdfjsLib.PDFDocumentProxy | undefined,
  scale: null as number | null,
  tool: "select" as Tool,
  highlights: [] as Highlight[],
};

type ViewerContextType = typeof initialState & {
  setState: React.Dispatch<React.SetStateAction<typeof initialState>>;
};

const ViewerProvider = createContext<ViewerContextType>(null as any);

export default function PdfViewer({ url }: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewerState, setViewerState] = useState(initialState);

  // Load PDF
  useEffect(() => {
    const loadPdf = async () => {
      const doc = await pdfjsLib.getDocument(getImageProxyUrl(url)).promise;
      setViewerState((s) => ({
        ...s,
        pdfDoc: doc,
        pageCount: doc.numPages,
      }));
    };
    loadPdf();
  }, [url]);

  return (
    <ViewerProvider value={{ ...viewerState, setState: setViewerState }}>
      <div className="w-full relative pt-10 h-full flex flex-col items-center bg-[#242323]">
        <PDFControls />
        <div
          id="pdf-container"
          ref={containerRef}
          className="relative w-full max-w-[800px] overflow-y-auto h-full border-2 m-auto flex flex-col items-start"
        >
          {viewerState.pdfDoc &&
            Array.from({ length: viewerState.pageCount }, (_, i) => (
              <PdfPage
                key={i + 1}
                num={i + 1}
                containerRef={containerRef as any}
              />
            ))}
        </div>
      </div>
    </ViewerProvider>
  );
}

function PdfPage({
  num,
  containerRef,
}: {
  num: number;
  containerRef: RefObject<HTMLDivElement>;
}) {
  const { pdfDoc, scale, setState, tool, highlights } =
    useContext(ViewerProvider);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);

  // const render
  const renderTask = useRef<any>(null);

  useEffect(() => {
    if (!pdfDoc) return;

    const renderPage = async () => {
      const page = await pdfDoc.getPage(num);
      const unscaledVp = page.getViewport({ scale: 1 });

      let effectiveScale = scale;
      if (scale === null) {
        const containerWidth = containerRef.current!.clientWidth || 800;
        effectiveScale = containerWidth / unscaledVp.width;
        setState((s) => ({ ...s, scale: effectiveScale }));
      }

      const vp = page.getViewport({ scale: effectiveScale! });

      const outputScale = window.devicePixelRatio || 1;

      // ✅ Render canvas
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      canvas.width = Math.floor(vp.width * outputScale);
      canvas.height = Math.floor(vp.height * outputScale);
      canvas.style.width = `${vp.width}px`;
      canvas.style.height = `${vp.height}px`;

      const transform =
        outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;

      if (renderTask.current) renderTask.current.cancel();

      renderTask.current = page.render({
        canvasContext: ctx,
        viewport: vp,
        canvas,
        transform,
      });

      await renderTask.current.promise;

      // ✅ Render text layer
      if (textLayerRef.current) {
        textLayerRef.current.innerHTML = "";
        const textLayer = new pdfjsLib.TextLayer({
          textContentSource: page.streamTextContent(),
          viewport: vp,
          container: textLayerRef.current,
        });
        await textLayer.render();
      }
    };

    renderPage();

    return () => {
      if (renderTask.current) {
        console.log("=============== cancelled");
        renderTask.current.cancel();
      }
    };
  }, [pdfDoc, scale, num]);

  // ✅ Highlight selection logic
  useEffect(() => {
    if (!pdfDoc || tool !== "highlight") return;

    const overlay = textLayerRef.current;
    if (!overlay) return;

    let isDrawing = false;
    let startX = 0;
    let startY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDrawing = true;
      const rect = overlay.getBoundingClientRect();
      startX = e.clientX - rect.left;
      startY = e.clientY - rect.top;
    };

    const onMouseUp = async (e: MouseEvent) => {
      if (!isDrawing) return;
      isDrawing = false;

      const rect = overlay.getBoundingClientRect();
      const endX = e.clientX - rect.left;
      const endY = e.clientY - rect.top;

      const selectX = Math.min(startX, endX);
      const selectY = Math.min(startY, endY);
      const selectWidth = Math.abs(endX - startX);
      const selectHeight = Math.abs(endY - startY);
      if (selectWidth < 5 || selectHeight < 5) return;

      const page = await pdfDoc.getPage(num);
      const vp = page.getViewport({ scale: scale! });
      const textContent = await page.getTextContent();

      const quads: { x: number; y: number; w: number; h: number }[] = [];
      for (const item of textContent.items as any[]) {
        const tx = pdfjsLib.Util.transform(vp.transform, item.transform);

        // --- START OF CORRECTIONS ---

        // 1. Scale the item's width and height to match the viewport

        console.log("+++++++++++++++++++++++++", scale);
        const w = item.width * scale!;
        const h = item.height * scale!;

        // 2. Get the scaled X coordinate (this was already correct)
        const x = tx[4];

        // 3. Convert the Y coordinate from PDF's bottom-left origin
        //    to the browser's top-left origin.
        const y = vp.height - tx[5];

        // console.log("Corrected value", { x, y, w, h });

        // This `if` condition will now work correctly
        if (
          x < selectX + selectWidth && // Item's left is left of selection's right
          x + w > selectX && // Item's right is right of selection's left
          y < selectY + selectHeight && // Item's top is above selection's bottom
          y + h > selectY // Item's bottom is below selection's top
        ) {
          quads.push({
            x: x / scale!, // saved x as their unscaled variant
            y: y / scale!, // saved y as their unscaled variant
            w: w / scale!, // saved w as their unscaled variant
            h: h / scale!, // saved h as their unscaled variant
          });
        }
        // --- END OF CORRECTIONS ---
      }

      // console.log("Found quads:", quads);

      if (quads.length > 0) {
        setState((s) => ({
          ...s,
          highlights: [
            ...s.highlights,
            { id: `${Date.now()}-${Math.random()}`, page: num, quads },
          ],
        }));
      }
    };

    overlay.addEventListener("mousedown", onMouseDown);
    overlay.addEventListener("mouseup", onMouseUp);

    return () => {
      overlay.removeEventListener("mousedown", onMouseDown);
      overlay.removeEventListener("mouseup", onMouseUp);
    };
  }, [pdfDoc, tool, num, scale]);

  return (
    <div className="relative mb-2">
      <canvas ref={canvasRef} className="block" />
      <div
        ref={textLayerRef}
        className="absolute top-0 left-0 w-full h-full textLayer z-20"
      />
      {/* ✅ Highlights for this page */}
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-30">
        {highlights
          .filter((hl) => hl.page === num)
          .map((hl) => {
            const clipId = `clip-${hl.id}`;
            return (
              <g key={hl.id}>
                <defs>
                  <clipPath id={clipId}>
                    {hl.quads.map((q, i) => (
                      <rect
                        key={i}
                        x={q.x * scale!}
                        y={q.y * scale!}
                        width={q.w * scale!}
                        height={q.h * scale!}
                      />
                    ))}
                  </clipPath>
                </defs>
                <rect
                  x="0"
                  y="0"
                  width="100%"
                  height="100%"
                  fill="yellow"
                  opacity="0.4"
                  clipPath={`url(#${clipId})`}
                />
              </g>
            );
          })}
      </svg>
    </div>
  );
}

function PDFControls() {
  const { pageCount, tool, setState, scale } = useContext(ViewerProvider);

  const setTool = (t: Tool) => {
    setState((s) => ({ ...s, tool: t }));
  };

  // const navigateToPage = (page: number) => {
  //   if (page <= pageCount && page >= 1) {
  //     setState((s) => ({ ...s, currentPage: page }));
  //   }

  //   const target = document.getElementById(`pdf_viewer__page-${page}`);
  //   if (target) {
  //     target.scrollIntoView({ behavior: "smooth", block: "start" });
  //   }
  // };

  const zoomIn = () => {
    setState((s) => ({ ...s, scale: s.scale ? s.scale * 1.2 : 1.2 }));
  };

  const zoomOut = () => {
    setState((s) => ({ ...s, scale: s.scale ? s.scale / 1.2 : 1 }));
  };

  return (
    <div className="bg-[#504f4f] text-white flex items-center justify-between px-4 h-10 absolute left-0 top-0 w-full md:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button type="button" className="cursor-pointer hover:text-gray-300">
            <FaAngleLeft />
          </button>
          <div className="flex items-center gap-1">
            <input
              className="w-8 px-1 bg-white text-black text-center rounded"
              value={"1"}
              type="text"
            />
            <span>/</span>
            <span>{pageCount}</span>
          </div>
          <button type="button" className="cursor-pointer hover:text-gray-300">
            <FaAngleRight />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setTool("highlight")}
            className={`cursor-pointer hover:text-gray-300 ${
              tool === "highlight" ? "text-yellow-400" : ""
            }`}
          >
            <FaHighlighter />
          </button>
          <button
            type="button"
            onClick={() => setTool("comment")}
            className={`cursor-pointer hover:text-gray-300 ${
              tool === "comment" ? "text-blue-400" : ""
            }`}
          >
            <FaRegCommentDots />
          </button>
          <button
            type="button"
            onClick={() => setTool("copy")}
            className={`cursor-pointer hover:text-gray-300 ${
              tool === "copy" ? "text-green-400" : ""
            }`}
          >
            <FaCopy />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="cursor-pointer hover:text-gray-300"
          onClick={zoomOut}
        >
          <FaSearchMinus />
        </button>
        <span className="text-sm">{Math.floor((scale || 1) * 100)}%</span>
        <button
          type="button"
          className="cursor-pointer hover:text-gray-300"
          onClick={zoomIn}
        >
          <FaSearchPlus />
        </button>
      </div>
    </div>
  );
}
