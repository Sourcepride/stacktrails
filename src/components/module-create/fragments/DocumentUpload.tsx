import PdfViewer from "@/common/document/PDFViewer";
import UploadFile from "@/common/media/UploadFile";
import { AvailableSources } from "@/common/media/media.constants";
import appAxios from "@/lib/axiosClient";
import { extractExternalId } from "@/lib/utils";
import { BackendRoutes } from "@/routes";
import { Button } from "@mui/material";
import { IoTrashBin } from "@react-icons/all-files/io5/IoTrashBin";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useCallback, useContext, useState } from "react";
import { ContentProvider } from "../ModuleForm";

type DocumentUploadProps = Record<string, never>;

type DocumentMutationData = Omit<DocumentItem, "provider"> & {
  provider: "google_drive" | "dropbox" | "direct_link";
};

const DocumentUpload: React.FC<DocumentUploadProps> = () => {
  const t = useTranslations();
  const [error, setError] = useState("");
  const { setContentData, contentData } = useContext(ContentProvider);

  const normalizeProvider = useCallback(
    (
      provider: DocumentMutationData["provider"]
    ): DocumentMutationData["provider"] => {
      return ["youtube", "dailymotion"].includes(provider)
        ? "direct_link"
        : provider;
    },
    []
  );

  const mapProviderToExtractId = useCallback(
    (
      provider: DocumentMutationData["provider"]
    ): "youtube" | "dailymotion" | "dropbox" | "google_drive" => {
      if (provider === "dropbox") return "dropbox";
      if (provider === "google_drive") return "google_drive";
      return "google_drive"; // fallback
    },
    []
  );

  const { mutate, isPending } = useMutation({
    mutationFn: async (
      data: DocumentMutationData
    ): Promise<DocumentValidationResponse> => {
      const { data: resp } = await appAxios.post(
        BackendRoutes.VALIDATE_DOCUMENT,
        {
          ...data,
          provider: normalizeProvider(data.provider),
        }
      );

      return resp;
    },
    onSuccess(data, variables) {
      const fileUrl = data.direct_url || variables.url;
      const embedUrl = data.embed_url || fileUrl;
      const externalId =
        extractExternalId(
          mapProviderToExtractId(variables.provider),
          embedUrl
        ) || crypto.randomUUID();

      setContentData({
        type: "document",
        embed_url: data.embed_url,
        external_file_id: externalId,
        file_url: fileUrl,
        platform: variables.provider as CreateDocumentContent["platform"],
        file_name: variables.file_name || "unknown",
        file_type: data.media_type || variables.media_type,
      });
      setError("");
    },
    onError() {
      setError(t("PROCESSING_FAILED"));
    },
  });

  const mapAvailableSourceToProvider = useCallback(
    (source: AvailableSources): DocumentMutationData["provider"] => {
      if (source === "link") return "direct_link";
      if (source === "drop_box") return "dropbox";
      return "google_drive";
    },
    []
  );

  const uploadHandler = useCallback(
    (url: string, provider: AvailableSources) => {
      setError("");
      mutate({
        url,
        media_type: "document",
        provider: mapAvailableSourceToProvider(provider),
      });
    },
    [mutate, mapAvailableSourceToProvider]
  );

  const handleRemove = useCallback(() => {
    setContentData(
      undefined as unknown as Parameters<typeof setContentData>[0]
    );
    setError("");
  }, [setContentData]);

  const isDocumentContent = contentData?.type === "document";
  const documentContent = isDocumentContent
    ? (contentData as Extract<typeof contentData, { type: "document" }>)
    : null;

  return (
    <div className="w-full">
      {isPending && (
        <div className="text-orange-500 font-bold text-sm">
          {t("PROCESSING")}
        </div>
      )}
      {error && <div className="text-red-500 font-bold text-sm">{error}</div>}

      {isDocumentContent && documentContent && (
        <div>
          <div className="flex items-center justify-end py-4">
            <Button
              color="error"
              size="large"
              className="!capitalize flex items-center gap-1"
              onClick={handleRemove}
              type="button"
            >
              <span>{t("REMOVE")}</span>
              <span>
                <IoTrashBin />
              </span>
            </Button>
          </div>
          <div className="w-full relative h-[500px] rounded-lg">
            <PdfViewer url={documentContent.file_url} />
          </div>
        </div>
      )}

      {!contentData && (
        <div
          className={isPending ? "opacity-50 pointer-events-none" : undefined}
        >
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
