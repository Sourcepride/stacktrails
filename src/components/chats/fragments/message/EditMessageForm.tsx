import { IconButton, TextField } from "@mui/material";
import { FaCheck } from "@react-icons/all-files/fa/FaCheck";
import { FaTimes } from "@react-icons/all-files/fa/FaTimes";

type EditMessageFormProps = {
  content: string;
  onChange: (content: string) => void;
  onSave: () => void;
  onCancel: () => void;
};

export default function EditMessageForm({
  content,
  onChange,
  onSave,
  onCancel,
}: EditMessageFormProps) {
  return (
    <div className="space-y-2">
      <TextField
        fullWidth
        multiline
        maxRows={6}
        value={content}
        onChange={(e) => onChange(e.target.value)}
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSave();
          }
          if (e.key === "Escape") {
            onCancel();
          }
        }}
        sx={{
          "& .MuiInputBase-root": {
            backgroundColor: "white",
          },
        }}
      />
      <div className="flex gap-2 justify-end">
        <IconButton
          size="small"
          onClick={onCancel}
          aria-label="Cancel edit"
        >
          <FaTimes size={14} />
        </IconButton>
        <IconButton
          size="small"
          color="primary"
          onClick={onSave}
          aria-label="Save edit"
          disabled={!content.trim()}
        >
          <FaCheck size={14} />
        </IconButton>
      </div>
    </div>
  );
}

