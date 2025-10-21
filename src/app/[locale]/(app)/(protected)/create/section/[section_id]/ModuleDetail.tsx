"use client";

import PdfViewer from "@/common/document/PDFViewer";
import AppDrawer from "@/common/drawer/AppDrawer";
import AppDrawerRow from "@/common/drawer/AppDrawerRow";
import AppDrawerSectionHeader from "@/common/drawer/AppDrawerSectionHeader";
import MarkdownRenderer from "@/common/markdown/AppMdRenderer";
import VidPlayer from "@/common/video/VidPlayer";
import { Link } from "@/i18n/navigation";
import { AppRoutes } from "@/routes";
import { Button, IconButton, Modal } from "@mui/material";
import { IoClose } from "@react-icons/all-files/io5/IoClose";
import { useTranslations } from "next-intl";
import { useState } from "react";
import Attachments from "./Attachments";

type ModuleDetailProps = { data: FullModule; onClose: () => void };
const ModuleDetail: React.FC<ModuleDetailProps> = ({ data, onClose }) => {
  const t = useTranslations();
  const [showAttachments, setShowAttachments] = useState(false);
  return (
    <AppDrawer isOpen={true} close={onClose} topBorder>
      <AppDrawerSectionHeader>Details</AppDrawerSectionHeader>

      <div className="px-4 lg:px-6">
        <AppDrawerRow header={t("MODULE.TITLE")} jsx={data.title} />
        <AppDrawerRow header={t("MODULE.DESCRIPTION")} jsx={data.description} />
        <AppDrawerRow header={t("MODULE.ORDER")} jsx={data.order_index} />
        <AppDrawerRow
          header={t("SECTIONS.ESTIMATE_DURATION")}
          jsx={data.estimated_duration_minutes}
        />
        <AppDrawerRow
          header={t("MODULE.MODULE_TYPE")}
          jsx={<ModuleType data={data} />}
        />
      </div>

      <AppDrawerSectionHeader>
        {t("MODULE.PREREQUISITES")}
      </AppDrawerSectionHeader>
      <div className="px-4 lg:px-6">
        {data.prerequisites?.map((objective, index) => (
          <div key={"objective" + index} className="flex items-start gap-3">
            <span className="text-sm leading-relaxed">{objective}</span>
          </div>
        ))}
      </div>

      <div className="px-4 flex flex-col gap-4 lg:px-6">
        <Button
          fullWidth
          disableElevation
          sx={{ textTransform: "capitalize" }}
          color="secondary"
          onClick={() => setShowAttachments(true)}
        >
          {t("MODULE.ATTACHMENTS")}
        </Button>

        <Link
          href={AppRoutes.EDIT_MODULE(data.section_id, data.id)}
          className="w-full"
        >
          <Button
            fullWidth
            disableElevation
            sx={{ textTransform: "capitalize" }}
          >
            {t("MODULE.EDIT")}
          </Button>
        </Link>
        {showAttachments && (
          <Attachments data={data} onClose={() => setShowAttachments(false)} />
        )}
      </div>
    </AppDrawer>
  );
};

export default ModuleDetail;

function ModuleType({ data }: { data: FullModule }) {
  const t = useTranslations();
  const [showPreview, setShowPreview] = useState(false);
  return (
    <div className="flex items-center gap-2">
      <div>{data.module_type}</div>
      <Button
        type="button"
        variant="outlined"
        size="small"
        className="!capitalize !h-9"
        onClick={() => setShowPreview(true)}
      >
        {t("PREVIEW")}
      </Button>
      <Modal open={showPreview} onClose={() => setShowPreview(false)}>
        <section
          className="absolute top-1/2 left-1/2 w-[96%] max-w-[800px] overflow-y-auto bg-white rounded-2xl shadow-lg p-4"
          style={{ transform: "translate(-50%, -50%)" }}
        >
          {/* Header */}
          <div className="flex justify-end items-center mb-6">
            <IconButton onClick={() => setShowPreview(false)} size="small">
              <IoClose size={25} />
            </IconButton>
          </div>
          {data.module_type === "video" && (
            <div className="h-[300px] md:h-[400px]">
              <VidPlayer
                src={
                  data.video_content?.embed_url || data.video_content?.video_url
                }
              />
            </div>
          )}
          {data.module_type === "document" && (
            <div className="h-[500px]">
              <PdfViewer
                url={
                  data.document_content?.embed_url ||
                  data.document_content?.file_url
                }
              />
            </div>
          )}
          {data.module_type === "discussion" && (
            <div className="text-black h-[400px]">
              <MarkdownRenderer
                content={(data.content_data as any)?.content || ""}
              />
            </div>
          )}
          {data.module_type === "external_link" && (
            <div className="border rounded-md w-full p-4">
              {(data.content_data as any)?.content ? (
                <a
                  href={(data.content_data as any)?.content}
                  target="_blank"
                  className="underline to-blue-500"
                >
                  {(data.content_data as any).content}
                </a>
              ) : (
                <div>not set</div>
              )}
            </div>
          )}
        </section>
      </Modal>
    </div>
  );
}
