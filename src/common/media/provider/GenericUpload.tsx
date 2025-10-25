"use client";

import LoadingModal from "@/common/popups/LoadingModal";
import { DocumentPlatform } from "@/constants";
import { useUploads } from "@/hooks/useUploads";
import useUploadToDrive from "@/hooks/useUploadtoDrive";
import useUploadToDropbox from "@/hooks/useUploadToDropBox";
import { appToast } from "@/lib/appToast";
import { cacheKeys } from "@/lib/cacheKeys";
import { listStorageProviders } from "@/lib/http/mediaFunc";
import { useAppStore } from "@/store";
import { Button, LinearProgress, Modal } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { storageCheckOrRedirect } from "../helpers";
import StorageFileDisplay from "../StorageFileDisplay";
import FileUploadBox from "./FileUploadBox";

type GenericUploadProps = {
  provider: "google_drive" | "dropbox";
  onClose: () => void;
  onCompleted: (urls: string[]) => void;
};
const GenericUpload: React.FC<GenericUploadProps> = ({
  provider,
  onClose,
  onCompleted,
}) => {
  const t = useTranslations();
  const [storageFolder, setStorageFolder] = useState({ name: "", id: "" });
  const [pickFolder, setPickFolder] = useState(false);
  const [file, setFile] = useState<File | null>();
  const uploadToDrive = useUploadToDrive();
  const uploadToDropBox = useUploadToDropbox();
  const { jobs } = useUploads();
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAppStore((s) => s);
  const { data, status } = useQuery({
    queryKey: [cacheKeys.LIST_PROVIDERS, user?.id],
    queryFn: listStorageProviders,
  });

  useEffect(() => {
    if (status === "success") {
      storageCheckOrRedirect(provider as DocumentPlatform, data, () => {});
    }
  }, [status, data]);

  // TODO: !Important this should me jobId instead.  should find a way of tracking jobId
  const currentJob = useMemo(
    () =>
      jobs.find(
        (v) => v.name === (file?.name ?? "no_/name") && v.type === provider
      ),
    [provider, file?.name, jobs]
  );

  const changeHandler = () => {
    if (!file) return appToast.Error(t("UPLOAD.CHOOSE_FILE"));
    setIsLoading(true);

    if (provider === "google_drive")
      uploadToDrive({ files: [file] })
        .then((d) => {
          onCompleted(d);
          onClose();
        })
        .finally(() => setIsLoading(false));
    if (provider === "dropbox")
      uploadToDropBox({ files: [file] })
        .then((d) => {
          onCompleted(d);
          onClose();
        })
        .finally(() => setIsLoading(false));
  };

  const showPanel = currentJob && isLoading;

  return (
    <Modal open onClose={onClose}>
      <section className="w-[94%] p-4  fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-background md:max-w-[600px]">
        <div className="flex items-center justify-end py-2">
          {pickFolder && (
            <StorageFileDisplay
              chosenFileHandler={(file) => {
                setStorageFolder({
                  name: file.path || file.name,
                  id: file.path || file.id,
                });
              }}
              mimeType="folder"
              onClose={() => setPickFolder(false)}
              provider={provider as DocumentPlatform}
            />
          )}
          <Button
            variant="outlined"
            sx={{ borderColor: "gray", color: "black", fontSize: "12px" }}
            onClick={() => setPickFolder(true)}
            size="small"
          >
            {storageFolder.name || t("UPLOAD.ROOT")}
          </Button>
        </div>
        <div className={``}>
          <FileUploadBox onChange={(file) => setFile(file)} />
        </div>
        <div className="py-2">
          <Button
            className={""}
            fullWidth
            onClick={changeHandler}
            disabled={isLoading}
          >
            {t("UPLOAD.UPLOAD")}
          </Button>
        </div>

        {showPanel && (
          <div className="mt-4 text-center flex flex-col items-start">
            <p className="text-xs text-gray-600 mb-1 self-center">
              {t("UPLOAD.SAFELY_CLICK_AWAY")}
            </p>

            <Button
              type="button"
              color="error"
              size="small"
              className="!cursor-pointer !my-2 !capitalize !self-center "
              onClick={() => {
                currentJob?.cancel?.();
                setIsLoading(false);
              }}
            >
              {t("UPLOAD.CANCEL_UPLOAD")}
            </Button>

            <div className="flex flex-col justify-center">
              <span className="text-sm font-medium text-gray-700 mb-1">
                {currentJob.progress}%
              </span>
              <div className="w-full">
                <LinearProgress
                  variant="determinate"
                  value={currentJob.progress}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 3,
                    },
                    width: "100%",
                  }}
                />
              </div>
            </div>
          </div>
        )}
        {status === "pending" && <LoadingModal />}
      </section>
    </Modal>
  );
};

export default GenericUpload;
