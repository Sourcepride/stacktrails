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

type PdfPoint = {
  x: number;
  y: number;
};

type PdfCustomAnnotation = {
  id: string;
  text: string;
  page: number;
  point: PdfPoint;
  type: Omit<selectOptionsT | "copy">;
};

type ContextInfo = {
  pdfCoord: PdfPoint;
  screenCoord: { x: number; y: number };
  text?: string;
};

type selectOptionsT = "note" | "ai" | "copy";
type AnnotationPinProps = {
  annotation: PdfCustomAnnotation;
  viewport: pdfJs.PageViewport;
};

type AnnotationResp = {
  id: string;
  type: "note" | "highlight";
  page_number?: number;
  content?: string;
  meta_data?: { [string]: any };
  account_id: string;
};
