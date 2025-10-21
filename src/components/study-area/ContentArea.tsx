"use client";

import PdfViewer from "@/common/document/PDFViewer";
import MarkdownRenderer from "@/common/markdown/AppMdRenderer";
import ConfirmPopup from "@/common/popups/ComfirmPop";
import VidPlayer from "@/common/video/VidPlayer";
import { Button, CircularProgress } from "@mui/material";
import { FaChevronLeft } from "@react-icons/all-files/fa/FaChevronLeft";
import { FaChevronRight } from "@react-icons/all-files/fa/FaChevronRight";
import { FaLink } from "@react-icons/all-files/fa/FaLink";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";

type ContentAreaProps = {
  course: FullCourse;
  module: FullModule;
  isLoading?: boolean;
  incrementProgress: (d: { module_id: string }) => void;
  setCurrentModuleId: (id: string) => void;
};
const ContentArea: React.FC<ContentAreaProps> = ({
  module,
  isLoading,
  incrementProgress,
  course,
  setCurrentModuleId,
}) => {
  const t = useTranslations();
  const [showWarning, setShowWarning] = useState(
    module.module_type === "external_link"
  );
  const [showButtons, setShowButtons] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setShowButtons(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowButtons(false);
    }, 650); // 0.65 seconds delay
  };

  if (isLoading) {
    return (
      <div className="w-full grid place-items-center h-[630px] bg-black">
        <CircularProgress size={60} />
      </div>
    );
  }
  return (
    <div
      className="h-full w-full relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Navigation Buttons */}
      <div className="absolute left-0 top-0 h-full w-full z-10 flex items-center justify-start pointer-events-none">
        <button
          type="button"
          className={`w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-dark transition-all duration-300 pointer-events-auto ${
            showButtons
              ? "opacity-100 translate-x-2 md:translate-x-4"
              : "opacity-100 md:opacity-0 translate-x-2 md:translate-x-0"
          }`}
          onClick={() => {
            // Add your left navigation logic here
            /* 
              left click should go to previous module or section if any exists
                - check if module is first if it is check if there  is a previous section tke the last module 
                -  if module is not first take the previous one


            */

            const currentSectionIndex = course.sections.findIndex(
              (s) => s.id === module.section_id
            );

            const currentModuleIndex = course.sections[
              currentSectionIndex
            ].modules.findIndex((m) => m.id === module.id);

            // Assume that sections are ordered by order index
            if (currentSectionIndex === 0 && currentModuleIndex === 0) {
              return;
            }

            // previous section last module
            if (currentModuleIndex === 0) {
              const prevSection = course.sections[currentSectionIndex - 1];
              setCurrentModuleId(
                prevSection.modules[prevSection.modules.length - 1].id
              );

              return;
            }

            const currentSection = course.sections[currentSectionIndex];
            setCurrentModuleId(
              currentSection.modules[currentModuleIndex - 1].id
            );
          }}
        >
          <FaChevronLeft className="text-xs md:text-sm lg:text-base" />
        </button>
      </div>

      <div className="absolute right-0 top-0 h-full w-full z-10 flex items-center justify-end pointer-events-none">
        <button
          type="button"
          className={`w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-dark transition-all duration-300 pointer-events-auto ${
            showButtons
              ? "opacity-100 -translate-x-2 md:-translate-x-4"
              : "opacity-100 md:opacity-0 -translate-x-2 md:translate-x-0"
          }`}
          onClick={() => {
            // Add your right navigation logic here
            /*
            - check if module is the last if it is check if there is another section if there is move to it's first module
            -  if this is not the last section module move to the next
            
          */

            const currentSectionIndex = course.sections.findIndex(
              (s) => s.id === module.section_id
            );

            const currentModuleIndex = course.sections[
              currentSectionIndex
            ].modules.findIndex((m) => m.id === module.id);

            const currentSection = course.sections[currentSectionIndex];

            // Assume that sections are ordered by order index

            incrementProgress({ module_id: module.id });
            if (
              currentSectionIndex === course.sections.length - 1 &&
              currentModuleIndex === currentSection.modules.length - 1
            ) {
              return;
            }

            // previous section last module
            if (currentModuleIndex === currentSection.modules.length - 1) {
              const nextSection = course.sections[currentSectionIndex + 1];
              setCurrentModuleId(nextSection.modules[0].id);
              return;
            }

            setCurrentModuleId(
              currentSection.modules[currentModuleIndex + 1].id
            );
          }}
        >
          <FaChevronRight className="text-xs md:text-sm lg:text-base" />
        </button>
      </div>

      {module.module_type === "video" && (
        <div className="w-full lg:h-[630px]">
          <VidPlayer
            src={
              module.video_content.embed_url || module.video_content.video_url
            }
          />
        </div>
      )}
      {module.module_type === "document" && (
        <div className="w-full relative h-[460px] lg:h-[630px]">
          <PdfViewer
            url={module.document_content.file_url}
            docId={module.document_content.id}
          />
        </div>
      )}
      {module.module_type === "discussion" && (
        <div className="w-full border-b-16 overflow-y-auto bg-black relative h-[460px] md:px-2 md:border-b-1 lg:h-[630px]">
          <div className="bg-white py-12 px-4 max-w-[calc(80ch+8px)] mx-auto md:px-8">
            <MarkdownRenderer content={(module.content_data as any)?.content} />
          </div>
        </div>
      )}
      {module.module_type === "external_link" && (
        <div className="w-full grid place-items-center border-b-16 overflow-y-auto bg-black relative h-[460px] md:px-2 md:border-b-1 lg:h-[630px]">
          {showWarning && <CircularProgress size={60} />}
          {!showWarning && (
            <Button
              variant="outlined"
              sx={{
                borderColor: "white",
                color: "white",
              }}
              onClick={() => setShowWarning(true)}
            >
              {t("LINK")}
            </Button>
          )}
        </div>
      )}

      <ConfirmPopup
        header={
          <span className="text-red-600">{t("EXTERNAL_LINK.REDIRECT")}</span>
        }
        body={t("EXTERNAL_LINK.WARNING")}
        close={() => setShowWarning(false)}
        isOpen={showWarning}
        proceedCallback={
          () =>
            window.open(
              (module.content_data as any)?.content,
              "_blank",
              "noopener,noreferrer"
            )

          // To set the origin as referrer, we manually create an <a> and click it, since window.open with noreferrer doesn't send a referrer.
          // We'll use a workaround for full control:
          // (Note: This is the only reliable way in the browser, as no-referer disables referrer,
          // so to FORCE current origin as referrer, we must not use rel="noreferrer")

          // const a = document.createElement("a");
          // a.href = (module.content_data as any)?.content;
          // a.target = "_blank";
          // a.rel = "noopener"; // omit 'noreferrer' to allow referer header
          // document.body.appendChild(a);
          // a.click();
          // document.body.removeChild(a);

          // For security, you may want to choose between these two approaches.
        }
        cancelText={t("CANCEL_TEXT")}
        proceedText={t("EXTERNAL_LINK.OK")}
        icon={<FaLink />}
      />
    </div>
  );
};

export default ContentArea;
