import * as pdfjsLib from "pdfjs-dist";

import { useState } from "react";
import NoteAnnotationInput from "./NoteAnnotationInput";
import PdfSelectOptions from "./PdfSelectOptions";

type AnnotationUtilsProps = {
  contextInfo: ContextInfo;
  page: number;
  onClose: () => void;
  viewPort: pdfjsLib.PageViewport;
};

const AnnotationUtils: React.FC<AnnotationUtilsProps> = ({
  page,
  contextInfo,
  viewPort,
  onClose,
}) => {
  const [show, setShow] = useState(true);
  const [options, setOptions] = useState<selectOptionsT | undefined>();

  return (
    <>
      {show && (
        <PdfSelectOptions
          coord={contextInfo.screenCoord}
          onClose={onClose}
          onSelect={(v) => {
            setOptions(v);
            setShow(false);
          }}
          viewPort={viewPort}
        />
      )}
      {options === "note" && (
        <NoteAnnotationInput
          close={onClose}
          page={page}
          viewPort={viewPort}
          pdfCoord={contextInfo.pdfCoord}
          x={contextInfo.screenCoord.x}
          y={contextInfo.screenCoord.y}
        />
      )}
    </>
  );
};

export default AnnotationUtils;
