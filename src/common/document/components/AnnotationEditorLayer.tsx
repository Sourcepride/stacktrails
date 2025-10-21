import { FaTrash } from "@react-icons/all-files/fa/FaTrash";
import "pdfjs-dist/web/pdf_viewer.css";
import { useContext } from "react";
import { ViewerContext } from "../PDFViewer";

//--- AnnotationEditorLayer: Renders the interactive "BOXED DIV" ---
export default function AnnotationEditorLayer({
  pageNum,
}: {
  pageNum: number;
}) {
  const { highlights, scale, deleteHighlight, tool } =
    useContext(ViewerContext);
  const pageHighlights = highlights.filter((hl) => hl.page === pageNum);

  if (!pageHighlights.length || scale === null) return null;

  return (
    <div className="annotationEditorLayer absolute inset-0 pointer-events-none">
      {pageHighlights.map((hl) => {
        // Calculate the bounding box for all quads in the highlight
        if (!hl.quads.length) return null;

        const firstQuad = hl.quads[0];
        let minX = firstQuad.x;
        let minY = firstQuad.y;
        let maxX = firstQuad.x + firstQuad.w;
        let maxY = firstQuad.y + firstQuad.h;

        for (let i = 1; i < hl.quads.length; i++) {
          const q = hl.quads[i];
          minX = Math.min(minX, q.x);
          minY = Math.min(minY, q.y);
          maxX = Math.max(maxX, q.x + q.w);
          maxY = Math.max(maxY, q.y + q.h);
        }

        const box = {
          left: minX * scale,
          top: minY * scale,
          width: (maxX - minX) * scale,
          height: (maxY - minY) * scale,
        };

        // This is the BOXED DIV
        // TODO: this should be pointer events none until when user chooses highlight or double clicks in proximity of the highlight
        return (
          <div
            key={hl.id}
            className={`absolute border-2 border-dashed border-transparent hover:border-blue-500 pointer-events-auto group ${
              tool === "highlight"
                ? "pointer-events-auto"
                : "pointer-events-none"
            }`}
            style={box}
          >
            <button
              onClick={() => deleteHighlight(hl.id)}
              className="absolute -top-6 right-0 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              aria-label="Delete highlight"
            >
              <FaTrash />
            </button>
          </div>
        );
      })}
    </div>
  );
}
