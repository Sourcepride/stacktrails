"use client";

import { AiOutlineClose } from "@react-icons/all-files/ai/AiOutlineClose";
import { useEffect, useRef, useState } from "react";

interface FileUploadBoxProps {
  onChange?: (file: File | null) => void;
  accept?: string;
}

const FileUploadBox: React.FC<FileUploadBoxProps> = ({ onChange, accept }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMimeType(file.type);
    setFileName(file.name);
    onChange?.(file);

    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else if (file.type.startsWith("video/")) {
      const url = URL.createObjectURL(file);
      extractVideoFrame(url).then((frame) => {
        setPreviewUrl(frame);
        URL.revokeObjectURL(url);
      });
    } else {
      setPreviewUrl(null);
    }
  };

  const extractVideoFrame = (videoUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.src = videoUrl;
      video.crossOrigin = "anonymous";
      video.currentTime = 5;
      video.muted = true;
      video.playsInline = true;

      video.addEventListener("loadeddata", () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/png"));
        }
      });
    });
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setMimeType(null);
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onChange?.(null);
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div className="relative w-full h-[400px] bg-gray-200 flex items-center justify-center rounded-2xl border-2 border-dashed border-gray-400 overflow-hidden">
      {/* If it's an image or video preview */}
      {previewUrl ? (
        <img
          src={previewUrl}
          alt="Preview"
          className="w-full h-full object-cover"
        />
      ) : fileName ? (
        // Show filename for non-image/video files
        <span className="text-gray-700 font-medium px-4 text-center break-words">
          {fileName}
        </span>
      ) : (
        // Default text before file is uploaded
        <span className="text-gray-600 text-lg font-medium z-10 pointer-events-none">
          Upload file
        </span>
      )}

      {/* File input overlay (only active when no file is uploaded) */}
      {!previewUrl && !fileName && (
        <input
          ref={fileInputRef}
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileChange}
          accept={accept || "*/*"}
        />
      )}

      {/* Remove button */}
      {(previewUrl || fileName) && (
        <button
          onClick={handleRemove}
          className="absolute top-3 right-3 bg-white/80 hover:bg-white text-gray-700 p-2 rounded-full shadow-md transition"
        >
          <AiOutlineClose className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default FileUploadBox;
