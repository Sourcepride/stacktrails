import MarkdownRenderer from "@/common/markdown/AppMdRenderer";
import { FaFile } from "@react-icons/all-files/fa/FaFile";

type FileAttachmentProps = {
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  caption?: string | null;
};

// Helper function to format file size
function formatFileSize(bytes?: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileAttachment({
  fileUrl,
  fileName,
  fileSize,
  caption,
}: FileAttachmentProps) {
  return (
    <div className="space-y-2">
      <a
        href={fileUrl || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
      >
        <div className="flex-shrink-0 text-gray-600">
          <FaFile className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {fileName || "File"}
          </p>
          {fileSize && (
            <p className="text-xs text-gray-500">{formatFileSize(fileSize)}</p>
          )}
        </div>
      </a>
      {caption && (
        <div className="text-gray-900 whitespace-pre-wrap break-words text-sm">
          <MarkdownRenderer content={caption} />
        </div>
      )}
    </div>
  );
}

