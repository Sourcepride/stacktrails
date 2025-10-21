"use client";

import { appToast } from "@/lib/appToast";
import { Button, TextField } from "@mui/material";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { AvailableSources } from "./media.constants";
import CustomMenu from "./Sources";
import UploadWrapper from "./UploadWrapper";

//

type UploadFileProps = {
  accept: AvailableSources[];
  mimeType?: "video" | "document" | "image";
  callback: (url: string, provider: AvailableSources) => void;
};

type plugins = "link" | "pick" | "upload";

type Strategy = {
  plugins: plugins[];
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
  mimeType,
}) => {
  const t = useTranslations();
  const [error, setError] = useState("");
  const [source, setSource] = useState<AvailableSources>(accept[0]);

  const uploadedCallback = (url: string, plugin: plugins) => {
    if (plugin === "link") {
      const validator = strategies[source]?.linkValidator;

      if (validator && !validator(url)) {
        appToast.Error(t("UPLOAD.INVALID_LINK"));
        return;
      }
    }

    callback(url, source);
  };

  const plugins = strategies[source].plugins;

  return (
    <div className="rounded-xl bg-background ">
      <div className="py-4">
        <CustomMenu
          callback={(value: any) => setSource(value)}
          defaultVal={source}
          sources={accept}
        />
      </div>

      <div className="flex flex-col gap-4">
        {plugins.length > 1 && (
          <small className="text-orange-500 font-bold">Choose any option</small>
        )}
        {plugins.map((val, index) => (
          <div className="" key={val}>
            {val === "upload" && (
              <UploadWrapper
                onCompleted={(url) => uploadedCallback(url, "upload")}
                type="upload"
                provider={source}
                mimeType={mimeType || "document"}
              />
            )}
            {plugins.length > 1 && index < plugins.length - 1 ? (
              <div className="font-bold text-center pt-4 !uppercase">
                {t("AUTH.OR")}
              </div>
            ) : (
              ""
            )}
            {val === "pick" && (
              <UploadWrapper
                onCompleted={(url) => uploadedCallback(url, "pick")}
                type="picker"
                provider={source}
                mimeType={mimeType || "document"}
              />
            )}
            {val === "link" && (
              <LinkInput
                callback={(v) => {
                  uploadedCallback(v, "link");
                }}
                validator={strategies[source]?.linkValidator}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UploadFile;

function LinkInput({
  callback,
  validator,
}: {
  callback: (url: string) => void;
  validator?: (v: string) => boolean;
}) {
  const [hasError, setHasError] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const t = useTranslations();

  const submitHandler = () => {
    if (!ref.current) {
      return appToast.Error("An error occurred! Reload page to fix.");
    }

    if (validator && !validator(ref.current.value)) {
      setHasError(true);
      return;
    }

    setHasError(false);
    setDisabled(true); // disable input after success
    callback(ref.current.value);
    appToast.Success(t("LINK_SUBMITTED"));
  };

  const enableEditing = () => {
    setDisabled(false); // allow editing again
  };

  return (
    <div className="">
      <div className="flex items-center gap-4">
        <TextField
          inputRef={ref}
          fullWidth
          disabled={disabled}
          className=""
          placeholder={t("UPLOAD.LINK")}
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
      <div className="text-orange-500">
        {hasError && t("UPLOAD.INVALID_LINK")}
      </div>
    </div>
  );
}
