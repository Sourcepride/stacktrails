"use client";

import { appToast } from "@/lib/appToast";
import { Button, TextField } from "@mui/material";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useRef, useState } from "react";
import CustomMenu from "./Sources";
import UploadWrapper from "./UploadWrapper";
import { AvailableSources } from "./media.constants";

type UploadFileProps = {
  accept: AvailableSources[];
  mimeType?: "video" | "document" | "image";
  callback: (url: string, provider: AvailableSources) => void;
};

type Plugin = "link" | "pick" | "upload";

type Strategy = {
  plugins: Plugin[];
  linkValidator?: (v: string) => boolean;
};

const strategies: Record<AvailableSources, Strategy> = {
  google_drive: {
    plugins: ["upload", "pick"],
  },
  drop_box: {
    plugins: ["upload", "pick"],
  },
  daily_motion: {
    plugins: ["link"],
    linkValidator: (link: string) => {
      // Matches: https://www.dailymotion.com/video/{id}
      // or short form: https://dai.ly/{id}
      return /^(https?:\/\/)?(www\.)?(dailymotion\.com\/video\/|dai\.ly\/)[a-zA-Z0-9]+/.test(
        link
      );
    },
  },
  youtube: {
    plugins: ["upload", "link"],
    linkValidator: (link: string) => {
      // Matches: https://www.youtube.com/watch?v={id}
      // or short form: https://youtu.be/{id}
      return /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}/.test(
        link
      );
    },
  },
  link: {
    plugins: ["link"],
  },
};

//
const UploadFile: React.FC<UploadFileProps> = ({
  accept,
  callback,
  mimeType = "document",
}) => {
  const t = useTranslations();
  const [source, setSource] = useState<AvailableSources>(accept[0]);

  const currentStrategy = useMemo(() => strategies[source], [source]);

  const plugins = useMemo(() => currentStrategy.plugins, [currentStrategy]);

  const handleSourceChange = useCallback((value: string) => {
    setSource(value as AvailableSources);
  }, []);

  const uploadedCallback = useCallback(
    (url: string, plugin: Plugin) => {
      if (plugin === "link") {
        const validator = currentStrategy?.linkValidator;

        if (validator && !validator(url)) {
          appToast.Error(t("UPLOAD.INVALID_LINK"));
          return;
        }
      }

      callback(url, source);
    },
    [callback, source, currentStrategy, t]
  );

  const handleUploadComplete = useCallback(
    (url: string) => {
      uploadedCallback(url, "upload");
    },
    [uploadedCallback]
  );

  const handlePickComplete = useCallback(
    (url: string) => {
      uploadedCallback(url, "pick");
    },
    [uploadedCallback]
  );

  const handleLinkSubmit = useCallback(
    (url: string) => {
      uploadedCallback(url, "link");
    },
    [uploadedCallback]
  );

  const showMultipleOptions = plugins.length > 1;

  return (
    <div className="rounded-xl bg-background">
      <div className="py-4">
        <CustomMenu
          callback={handleSourceChange}
          defaultVal={source}
          sources={accept}
        />
      </div>

      <div className="flex flex-col gap-4">
        {showMultipleOptions && (
          <small className="text-orange-500 font-bold">Choose any option</small>
        )}
        {plugins.map((plugin, index) => (
          <div key={plugin}>
            {plugin === "upload" && (
              <UploadWrapper
                onCompleted={handleUploadComplete}
                type="upload"
                provider={source}
                mimeType={mimeType}
              />
            )}
            {showMultipleOptions && index < plugins.length - 1 && (
              <div className="font-bold text-center pt-4 !uppercase">
                {t("AUTH.OR")}
              </div>
            )}
            {plugin === "pick" && (
              <UploadWrapper
                onCompleted={handlePickComplete}
                type="picker"
                provider={source}
                mimeType={mimeType}
              />
            )}
            {plugin === "link" && (
              <LinkInput
                callback={handleLinkSubmit}
                validator={currentStrategy?.linkValidator}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UploadFile;

type LinkInputProps = {
  callback: (url: string) => void;
  validator?: (v: string) => boolean;
};

function LinkInput({ callback, validator }: LinkInputProps) {
  const [hasError, setHasError] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const t = useTranslations();

  const submitHandler = useCallback(() => {
    if (!ref.current) {
      appToast.Error("An error occurred! Reload page to fix.");
      return;
    }

    const url = ref.current.value.trim();

    if (validator && !validator(url)) {
      setHasError(true);
      return;
    }

    setHasError(false);
    setDisabled(true);
    callback(url);
    appToast.Success(t("LINK_SUBMITTED"));
  }, [callback, validator, t]);

  const enableEditing = useCallback(() => {
    setDisabled(false);
    setHasError(false);
  }, []);

  return (
    <div>
      <div className="flex items-center gap-4">
        <TextField
          inputRef={ref}
          fullWidth
          disabled={disabled}
          placeholder={t("UPLOAD.LINK")}
          error={hasError}
        />

        {!disabled ? (
          <Button
            color="success"
            type="button"
            className="h-full"
            onClick={submitHandler}
          >
            {t("DONE")}
          </Button>
        ) : (
          <Button
            color="primary"
            type="button"
            className="h-full"
            onClick={enableEditing}
          >
            {t("SECTIONS.EDIT")}
          </Button>
        )}
      </div>
      {hasError && (
        <div className="text-orange-500 text-sm mt-1">
          {t("UPLOAD.INVALID_LINK")}
        </div>
      )}
    </div>
  );
}
