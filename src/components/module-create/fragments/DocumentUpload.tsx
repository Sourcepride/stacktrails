import PdfViewer from "@/common/document/PDFViewer";
import { AvailableSources } from "@/common/media/media.constants";
import UploadFile from "@/common/media/UploadFile";
import appAxios from "@/lib/axiosClient";
import { extractExternalId } from "@/lib/utils";
import { BackendRoutes } from "@/routes";
import { Button } from "@mui/material";
import { IoTrashBin } from "@react-icons/all-files/io5/IoTrashBin";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useContext, useState } from "react";
import { ContentProvider } from "../ModuleForm";

type docProps = {};
const DocumentUpload: React.FC<docProps> = ({}) => {
  const t = useTranslations();
  const [error, setError] = useState("");
  // const [loadingMedia,  setLoadingMedia] =  useState(false)
  const { setContentData, contentData } = useContext(ContentProvider);

  const { mutate, isPending } = useMutation({
    mutationFn: async (
      data: Omit<DocumentItem, "provider"> & {
        provider: "google_drive" | "dropbox" | "direct_link";
      }
    ): Promise<DocumentValidationResponse> => {
      const { data: resp } = await appAxios.post(
        BackendRoutes.VALIDATE_DOCUMENT,
        {
          ...data,
          provider: ["youtube", "dailymotion"].includes(data.provider)
            ? "direct_link"
            : data.provider,
        }
      );

      return resp;
    },
    onSuccess(data, variables) {
      setContentData({
        type: "document",
        embed_url: data.embed_url,
        external_file_id:
          extractExternalId(
            variables.provider as any,
            data.direct_url || data.embed_url || variables.url
          ) || crypto.randomUUID(),
        file_url: data.direct_url || variables.url,
        platform: variables.provider,
        file_name: variables.file_name || "unknown",
        file_type: data.media_type || variables.media_type,
      });
    },
    onError(error, variables, context) {
      setError(t("PROCESSING_FAILED"));
    },
  });

  const uploadHandler = (url: string, provider: AvailableSources) => {
    mutate({
      url,
      media_type: "document",
      provider:
        provider === "link"
          ? "direct_link"
          : provider === "drop_box"
          ? "dropbox"
          : "google_drive",
    });
  };

  return (
    <div className="w-full">
      {isPending && (
        <div className="text-orange-500 font-bold  text-sm">
          {t("PROCESSING")}
        </div>
      )}
      {error && <div className="text-red-500 font-bold  text-sm">{error}</div>}

      {contentData?.type === "document" && (
        <div>
          <div className="flex items-center justify-end py-4">
            <Button
              color="error"
              size="large"
              className="!capitalize flex items-center gap-1"
              onClick={() => setContentData(undefined as any)}
              type="button"
            >
              <span>{t("REMOVE")}</span>
              <span>
                <IoTrashBin />
              </span>
            </Button>
          </div>
          <div className="w-full relative h-[500px] rounded-lg">
            <PdfViewer url={(contentData as any).file_url} />
          </div>
        </div>
      )}

      {!contentData && (
        <div className={`${isPending && "opacity-50 pointer-events-none"}`}>
          <UploadFile
            accept={["google_drive", "drop_box", "link"]}
            callback={uploadHandler}
            mimeType="document"
          />
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
