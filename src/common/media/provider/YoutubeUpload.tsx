import AppTextField from "@/common/forms/AppTextField";
import LoadingModal from "@/common/popups/LoadingModal";
import { BACKEND_API_URL } from "@/constants";
import { useUploads } from "@/hooks/useUploads";
import useUploadToYoutube from "@/hooks/useUploadToYoutube";
import { cacheKeys } from "@/lib/cacheKeys";
import { listStorageProviders } from "@/lib/http/mediaFunc";
import { BackendRoutes } from "@/routes";
import { useAppStore } from "@/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, LinearProgress, Modal } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import FileUploadBox from "./FileUploadBox";

type YoutubeUploadProps = {
  onClose: () => void;
  onCompleted: (urls: string[]) => void;
};

const schema = z.object({
  title: z.string().min(3),
  description: z.string(),
  file: z
    .custom<File>((val) => val instanceof File, { message: "File is required" })
    .refine((val) => !!val, "File is required"),
});

const YoutubeUpload: React.FC<YoutubeUploadProps> = ({
  onClose,
  onCompleted,
}) => {
  const { user } = useAppStore((state) => state);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProviders, setIsLoadingProviders] = useState(true);
  const form = useForm<z.infer<typeof schema>>({
    defaultValues: {},
    resolver: zodResolver(schema),
  });

  const { control, watch, setValue, handleSubmit } = form;
  const t = useTranslations();

  const file = watch("file");

  const upload = useUploadToYoutube();
  const { jobs } = useUploads();

  const { data, status } = useQuery({
    queryKey: [cacheKeys.LIST_PROVIDERS, user?.id],
    queryFn: listStorageProviders,
  });

  useEffect(() => {
    if (status !== "pending") {
      const provider = data?.items?.find((v) => v.provider === "google");

      if (
        !provider ||
        !(
          provider?.scopes?.includes(
            "https://www.googleapis.com/auth/youtube.upload"
          ) &&
          provider?.scopes?.includes(
            "https://www.googleapis.com/auth/youtube.readonly"
          )
        )
      ) {
        const url = new URL(BACKEND_API_URL + BackendRoutes.GOOGLE_INCREMENTAL);
        url.searchParams.append("redirect", location.href);
        url.searchParams.append(
          "required_scopes",
          "openid email profile https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly"
        );

        location.href = url.toString();
      }

      setIsLoadingProviders(false);
    }
  }, [status]);

  // TODO: !Important this should me jobId instead.  should find a way of tracking jobId
  const currentJob = useMemo(
    () =>
      jobs.find(
        (v) =>
          v.name === (file?.name ?? "youtube_no_name") && v.type === "youtube"
      ),
    [file?.name, jobs]
  );

  const onSubmit = (data: z.infer<typeof schema>) => {
    // kick off upload logic here

    setIsLoading(true);

    upload({
      filesMeta: [
        {
          file: data.file,
          metadata: {
            snippet: {
              title: data.title,
              description: data.description,
            },
            status: {
              privacyStatus: "public",
            },
          },
        },
      ],
    })
      .then((d) => {
        const videoUrl = `https://www.youtube.com/watch?v=${d?.[0]?.id}`;
        onCompleted([videoUrl]);
        onClose();
      })
      .finally(() => setIsLoading(false));
  };

  const showPanel = currentJob && isLoading;

  return (
    <Modal open onClose={onClose}>
      <section className="w-[94%] p-4 flex flex-col gap-4 fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-background md:max-w-[600px]">
        {isLoadingProviders && <LoadingModal />}
        <h1 className="text-xl font-bold">{t("UPLOAD.YOUTUBE_UPLOAD")} </h1>
        <div className="flex flex-col gap-4">
          <AppTextField
            control={control}
            fullWidth
            name="title"
            label={"title"}
          />
          <AppTextField
            control={control}
            fullWidth
            name="description"
            label={"description"}
            multiline
            minRows={5}
          />
        </div>
        <div className={``}>
          <FileUploadBox
            accept="video/*"
            onChange={(file) => {
              setValue("file", file as any, { shouldValidate: true });
            }}
          />
        </div>
        <div className="py-2">
          <Button
            className={""}
            fullWidth
            onClick={handleSubmit(onSubmit)}
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
      </section>
    </Modal>
  );
};

export default YoutubeUpload;
