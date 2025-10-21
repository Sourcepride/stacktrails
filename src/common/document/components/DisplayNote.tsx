import useHideOnClickedOutside from "@/hooks/useHideOnClickedOutside";
import { CgNotes } from "@react-icons/all-files/cg/CgNotes";
import { FaEdit } from "@react-icons/all-files/fa/FaEdit";
import { FaRegTrashAlt } from "@react-icons/all-files/fa/FaRegTrashAlt";
import { useTranslations } from "next-intl";
import { useContext, useState } from "react";
import { ViewerContext } from "../PDFViewer";
import NoteAnnotationInput from "./NoteAnnotationInput";

const DisplayNote: React.FC<AnnotationPinProps> = (props) => {
  const {
    annotation: { point },
    viewport,
  } = props;
  const [showContent, setShowContent] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [screenX, screenY] = viewport.convertToViewportPoint(point.x, point.y);

  const showPin = !isUpdating && !showContent;
  return (
    <div
      className={`absolute    pointer-events-auto`}
      style={{
        left: `${screenX}px`,
        top: `${screenY}px`,
        // This transform is crucial for positioning the *center* of the pin
        // at the coordinate, not its top-left corner.
        transform: "translate(-50%, -50%)",
      }}
    >
      {showPin && (
        <div
          onClick={() => setShowContent(true)}
          className="bg-blue-500 rounded-full w-6 h-6  grid place-items-center text-white border-2 border-white shadow-lg cursor-pointer"
          title="note"
        >
          <CgNotes size={12} />
        </div>
      )}
      {isUpdating && (
        <NoteAnnotationInput
          close={() => setIsUpdating(false)}
          page={props.annotation.page}
          pdfCoord={props.annotation.point}
          viewPort={viewport}
          x={0}
          y={0}
          update={{
            id: props.annotation.id,
            text: props.annotation.text,
          }}
        />
      )}
      {showContent && (
        <NoteText
          {...props}
          onClose={() => setShowContent(false)}
          update={() => {
            setIsUpdating(true);
            setShowContent(false);
          }}
        />
      )}
    </div>
  );
};

export default DisplayNote;

// & { coords: { x: number; y: number } }

function NoteText({
  annotation,
  update,
  onClose,
}: AnnotationPinProps & { onClose: () => void; update: () => void }) {
  const ref = useHideOnClickedOutside(onClose);
  const { deleteNote } = useContext(ViewerContext);
  const t = useTranslations();
  return (
    <div
      className={`w-[280px] p-2 rounded-md pt-4 bg-[#2e2d2d] text-white absolute`}
      style={{
        left: 0,
        top: 0,
      }}
      ref={ref}
    >
      <div className="flex absolute w-full px-4 text-gray-300 items-center gap-4 justify-end">
        <button type="button" onClick={update} title={t("EDIT")}>
          <FaEdit size={15} />
        </button>
        <button
          type="button"
          onClick={() => deleteNote(annotation.id)}
          title={t("DELETE")}
        >
          <FaRegTrashAlt size={15} />
        </button>
      </div>
      <div className="p-2 pt-6 text-sm">{annotation.text}</div>
    </div>
  );
}
