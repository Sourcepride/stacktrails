"use client";

import { DocumentPlatform } from "@/constants";
import { makeFilePublicDropbox } from "@/hooks/useUploadToDropBox";
import { makeGoogleFilePublic } from "@/hooks/useUploadtoDrive";
import { appToast } from "@/lib/appToast";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";
import StorageFileDisplay from "./StorageFileDisplay";
import { AvailableSources } from "./media.constants";
import GenericUpload from "./provider/GenericUpload";
import YoutubeUpload from "./provider/YoutubeUpload";

type UploadWrapperProps = {
  type: "upload" | "picker";
  onCompleted: (url: string, provider: AvailableSources) => void;
  storage?: string;
  provider: AvailableSources;
  mimeType: "image" | "document" | "video";
};

const mapAvailableSourceToDocumentPlatform = (
  source: AvailableSources
): DocumentPlatform | undefined => {
  if (source === "drop_box") return DocumentPlatform.DROPBOX;
  if (source === "google_drive") return DocumentPlatform.GOOGLE_DRIVE;
  return undefined;
};

const UploadWrapper: React.FC<UploadWrapperProps> = ({
  type,
  onCompleted,
  storage,
  mimeType,
  provider,
}) => {
  const t = useTranslations();
  const [show, setShow] = useState(false);

  const showPicker = useMemo(() => type === "picker" && show, [type, show]);
  const showUploader = useMemo(() => type === "upload" && show, [type, show]);
  const documentPlatform = useMemo(
    () => mapAvailableSourceToDocumentPlatform(provider),
    [provider]
  );

  const handleShow = useCallback(() => {
    setShow(true);
  }, []);

  const handleClose = useCallback(() => {
    setShow(false);
  }, []);

  const handleDropboxFile = useCallback(
    (fileId: string) => {
      makeFilePublicDropbox(fileId)
        .then((url) => {
          onCompleted(url, "drop_box");
          handleClose();
        })
        .catch(() => {
          appToast.Error(t("EXCEPTIONS.ERROR_OCCURRED"));
        });
    },
    [onCompleted, handleClose, t]
  );

  const handleGoogleDriveFile = useCallback(
    (fileId: string, accessToken?: string) => {
      makeGoogleFilePublic(fileId, accessToken)
        .then((url) => {
          onCompleted(url, provider);
          handleClose();
        })
        .catch((err: unknown) => {
          const errorMessage =
            err && typeof err === "object" && "message" in err
              ? String(err.message)
              : "";

          if (/[Pp]ermission/.test(errorMessage)) {
            appToast.Error(
              "Could not make file public. Try manually doing so from drive or pick file upload"
            );
            return;
          }
          appToast.Error(t("EXCEPTIONS.ERROR_OCCURRED"));
        });
    },
    [onCompleted, provider, handleClose, t]
  );

  const chosenFileHandler = useCallback(
    (file: FileResp, provider: DocumentPlatform, accessToken?: string) => {
      if (provider === DocumentPlatform.DROPBOX) {
        handleDropboxFile(file.id);
      } else if (provider === DocumentPlatform.GOOGLE_DRIVE) {
        handleGoogleDriveFile(file.id, accessToken);
      }
    },
    [handleDropboxFile, handleGoogleDriveFile]
  );

  const buttonText = useMemo(
    () =>
      type === "upload"
        ? t("UPLOAD.UPLOAD_FILE")
        : t("UPLOAD.SELECT", { storage: storage || "storage" }),
    [type, t, storage]
  );

  return (
    <div className="w-full">
      <button
        className="w-full h-[200px] border-gray-200 border-2 border-dashed rounded-md flex flex-col items-center justify-center"
        type="button"
        onClick={handleShow}
      >
        <span>{buttonText}</span>
      </button>

      {type === "picker" && (
        <p className="py-2 text-sm text-gray-400">{t("UPLOAD.WARNING_TEXT")}</p>
      )}

      {showUploader && (
        <SourcesSwitch
          onClose={handleClose}
          provider={provider}
          onCompleted={onCompleted}
        />
      )}
      {showPicker && documentPlatform && (
        <StorageFileDisplay
          chosenFileHandler={chosenFileHandler}
          mimeType={mimeType}
          onClose={handleClose}
          provider={documentPlatform}
        />
      )}
    </div>
  );
};

export default UploadWrapper;

type SourcesSwitchProps = {
  onClose: () => void;
  provider: AvailableSources;
  onCompleted: (url: string, provider: AvailableSources) => void;
};

function SourcesSwitch({ onClose, provider, onCompleted }: SourcesSwitchProps) {
  const handleGenericUploadComplete = useCallback(
    (urls: string[]) => {
      onCompleted(urls?.[0] ?? "", provider);
    },
    [onCompleted, provider]
  );

  switch (provider) {
    case "daily_motion":
      return null;
    case "google_drive":
      return (
        <GenericUpload
          onClose={onClose}
          provider="google_drive"
          onCompleted={handleGenericUploadComplete}
        />
      );
    case "drop_box":
      return (
        <GenericUpload
          onClose={onClose}
          onCompleted={handleGenericUploadComplete}
          provider="dropbox"
        />
      );
    case "youtube":
      return (
        <YoutubeUpload
          onClose={onClose}
          onCompleted={handleGenericUploadComplete}
        />
      );
    case "link":
      return null;
    default:
      return null;
  }
}
