import MarkdownRenderer from "@/common/markdown/AppMdRenderer";
import { getImageProxyUrl } from "@/lib/utils";
import Image from "next/image";

type ImageAttachmentProps = {
  imageUrl?: string | null;
  fileName?: string | null;
  caption?: string | null;
};

export default function ImageAttachment({
  imageUrl,
  fileName,
  caption,
}: ImageAttachmentProps) {
  if (!imageUrl) return null;

  return (
    <div className="space-y-2">
      <div className="relative rounded-lg overflow-hidden max-w-md">
        <Image
          src={getImageProxyUrl(imageUrl) || "/placeholder.png"}
          alt={fileName || "Image"}
          width={400}
          height={300}
          className="w-full h-auto object-contain rounded-lg"
          style={{ maxHeight: "400px" }}
        />
      </div>
      {caption && (
        <div className="text-gray-900 whitespace-pre-wrap break-words text-sm">
          <MarkdownRenderer content={caption} />
        </div>
      )}
    </div>
  );
}

