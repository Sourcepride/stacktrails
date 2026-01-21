"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";

type props = {
  title?: string;
  message?: React.ReactNode;
  width?: number;
  height?: number;
  className?: string;
};

export default function ErrorDisplay({
  title: inputTitle,
  className,
  width,
  height,
  message = "",
}: props) {
  const images = ["/empty_ghost.svg", "/crash_bin.svg"];
  const randomImage = images[Math.floor(Math.random() * images.length)];
  const t = useTranslations("EXCEPTIONS");

  const title = inputTitle || t("ERROR_OCCURRED");

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-8">
      <div className="mb-4">
        <Image
          src={randomImage}
          alt="Error state"
          width={width || 320}
          height={height || 320}
          className={`w-full max-w-[320px] lg:max-w-none lg:w-96 lg:h-96 ${className}`}
        />
      </div>
      <h3 className="text-lg font-semibold text-gray-600 mb-2">{title}</h3>
      {message && (
        <div className="text-sm text-gray-500 text-center max-w-md">{message}</div>
      )}
    </div>
  );
}
