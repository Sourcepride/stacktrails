import "pdfjs-dist/web/pdf_viewer.css";
import { useContext } from "react";
import { ViewerContext } from "../PDFViewer";

//--- HighlightLayer: Displays the created highlights as SVG elements ---
export default function HighlightLayer({ pageNum }: { pageNum: number }) {
  const { highlights, scale } = useContext(ViewerContext);
  const pageHighlights = highlights.filter((hl) => hl.page === pageNum);

  if (!pageHighlights.length || scale === null) return null;

  return (
    <>
      {pageHighlights.map((hl) => (
        <svg
          key={hl.id}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ zIndex: 0 }} // Sits below the text layer
        >
          <defs>
            <clipPath id={`clip-${hl.id}`}>
              {hl.quads.map((q, i) => (
                <rect
                  key={i}
                  x={q.x * scale}
                  y={q.y * scale}
                  width={q.w * scale}
                  height={q.h * scale}
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
            clipPath={`url(#clip-${hl.id})`}
          />
        </svg>
      ))}
    </>
  );
}
