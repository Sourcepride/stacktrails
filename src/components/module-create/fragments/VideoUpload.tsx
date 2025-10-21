import { AvailableSources } from "@/common/media/media.constants";
import UploadFile from "@/common/media/UploadFile";
import VidPlayer from "@/common/video/VidPlayer";
import appAxios from "@/lib/axiosClient";
import { extractExternalId } from "@/lib/utils";
import { BackendRoutes } from "@/routes";
import { Button } from "@mui/material";
import { IoTrashBin } from "@react-icons/all-files/io5/IoTrashBin";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useContext, useState } from "react";
import { ContentProvider } from "../ModuleForm";

type pageProps = {};
const VideoUpload: React.FC<pageProps> = ({}) => {
  const t = useTranslations();
  const [error, setError] = useState("");
  // const [loadingMedia,  setLoadingMedia] =  useState(false)
  const { setContentData, contentData } = useContext(ContentProvider);

  const { mutate, isPending } = useMutation({
    mutationFn: async (
      data: Omit<DocumentItem, "provider"> & {
        provider: "google_drive" | "dailymotion" | "dropbox" | "youtube";
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
        type: "video",
        embed_url: data.embed_url,
        external_video_id:
          extractExternalId(
            variables.provider,
            data.direct_url || data.embed_url || variables.url
          ) || crypto.randomUUID(),
        video_url: data.direct_url || variables.url,
        platform: variables.provider.split("_").join("") as any,
      });
    },
    onError(error, variables, context) {
      setError(t("PROCESSING_FAILED"));
    },
  });

  const uploadHandler = (url: string, provider: AvailableSources) => {
    mutate({
      url,
      media_type: "video",
      provider:
        provider === "google_drive"
          ? provider
          : (provider.split("_").join("") as any),
    });
  };

  return (
    <div className="">
      {isPending && (
        <div className="text-orange-500 font-bold  text-sm">
          {t("PROCESSING")}
        </div>
      )}
      {error && <div className="text-red-500 font-bold  text-sm">{error}</div>}
      {contentData?.type === "video" && (
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
            <VidPlayer
              src={contentData.embed_url || (contentData as any).video_url}
            />
          </div>
        </div>
      )}
      {!contentData && (
        <div className={`${isPending && "opacity-50 pointer-events-none"}`}>
          <UploadFile
            accept={["youtube", "daily_motion", "google_drive", "drop_box"]}
            callback={uploadHandler}
            mimeType="video"
          />
        </div>
      )}
    </div>
  );
};

export default VideoUpload;
