"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";

type ComingSoonProps = {
  // title?: string;
  // message?: string;
  width?: number;
  height?: number;
  className?: string;
  message?: string;
};
const ComingSoon: React.FC<ComingSoonProps> = ({
  width,
  height,
  className,
  message,
}) => {
  const t = useTranslations();

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-8">
      <div className="mb-4">
        <Image
          src={"/Construction worker-bro.svg"}
          alt="Error state"
          width={width || 280}
          height={height || 280}
          className={`max-w-[320px]   ${className}`}
        />
      </div>
      <h3 className="text-lg font-semibold text-gray-600 mb-2">
        {t("COMING_SOON")}
      </h3>
      <p className="text-sm text-gray-500 text-center max-w-md">
        {message || t("UNDER_CONSTRUCTION")}
      </p>
    </div>
  );
};

export default ComingSoon;
