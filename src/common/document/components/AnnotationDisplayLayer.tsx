import * as pdfjsLib from "pdfjs-dist";
import { useContext } from "react";
import { ViewerContext } from "../PDFViewer"; // Adjust import path
import AnnotationPin from "./AnnotationPin";

type AnnotationDisplayLayerProps = {
  pageNum: number;
  viewport: pdfjsLib.PageViewport;
};

export default function AnnotationDisplayLayer({
  pageNum,
  viewport,
}: AnnotationDisplayLayerProps) {
  const { annotations, showAnnotations } = useContext(ViewerContext);

  // Filter annotations to only show ones for the current page
  const pageAnnotations = annotations.filter((anno) => anno.page === pageNum);

  if (pageAnnotations.length === 0 || !showAnnotations) {
    return null;
  }

  return (
    <div className="annotationDisplayLayer absolute  top-0 left-0 w-full h-full pointer-events-none">
      {pageAnnotations.map((anno) => (
        <AnnotationPin key={anno.id} annotation={anno} viewport={viewport} />
      ))}
    </div>
  );
}
