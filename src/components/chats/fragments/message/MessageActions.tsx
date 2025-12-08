import { IconButton } from "@mui/material";
import { FaEdit } from "@react-icons/all-files/fa/FaEdit";
import { FaTrash } from "@react-icons/all-files/fa/FaTrash";

type MessageActionsProps = {
  onEdit: () => void;
  onDelete: () => void;
  show: boolean;
};

export default function MessageActions({
  onEdit,
  onDelete,
  show,
}: MessageActionsProps) {
  if (!show) return null;

  return (
    <div className="absolute -top-2 right-2 flex gap-1 transition-opacity">
      <IconButton
        size="small"
        onClick={onEdit}
        aria-label="Edit message"
        sx={{
          backgroundColor: "black",
          boxShadow: 1,
          "&:hover": {
            backgroundColor: "black",
          },
          width: 28,
          height: 28,
        }}
      >
        <FaEdit size={12} className="!text-gray-600" />
      </IconButton>
      <IconButton
        size="small"
        onClick={onDelete}
        aria-label="Delete message"
        sx={{
          backgroundColor: "black",
          boxShadow: 1,
          "&:hover": {
            backgroundColor: "black",
          },
          width: 28,
          height: 28,
        }}
      >
        <FaTrash size={12} className="!text-red-600" />
      </IconButton>
    </div>
  );
}
