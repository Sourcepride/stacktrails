import { DocumentPlatform, MIME_TYPE_GROUPS } from "@/constants";
import { cacheKeys } from "@/lib/cacheKeys";
import { listStorageProviders } from "@/lib/http/mediaFunc";
import { useAppStore } from "@/store";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  getFreshGoogleAccessToken,
  openPicker,
  storageCheckOrRedirect,
} from "../helpers";

type params = {
  showPicker: boolean;
  onPick: (file: FileResp, provider: DocumentPlatform) => void;
  onClose: () => void;
  mimeType: "image" | "document" | "video" | "folder";
};

type PickerResp = {
  description: string;
  driveError: string;
  driveSuccess: boolean;
  embedUrl: string;
  iconUrl: string;
  id: string;
  isShared: boolean;
  lastEditedUtc: number;
  mimeType: string;
  name: string;
  parentId: string;
  rotation: number;
  rotationDegree: number;
  serviceId: string;
  sizeBytes: number;
  type: string;
  url: string;
};

const useGooglePicker = ({ showPicker, onPick, onClose, mimeType }: params) => {
  const { user } = useAppStore((s) => s);
  const { data, status } = useQuery({
    queryKey: [cacheKeys.LIST_PROVIDERS, user?.id],
    queryFn: listStorageProviders,
    enabled: showPicker,
  });

  useEffect(() => {
    if (!showPicker) return;
    if (status !== "success") return;

    storageCheckOrRedirect(DocumentPlatform.GOOGLE_DRIVE, data, () => {
      const func = async () => {
        const accessToken = await getFreshGoogleAccessToken();
        openPicker(
          accessToken,
          (v: PickerResp[]) => {
            if (v.length < 1) return;
            onPick(
              {
                id: v[0].id,
                name: v[0].name,
                type: "file",
                mime_type: v[0].mimeType,
                url: v[0].url,
              },
              DocumentPlatform.GOOGLE_DRIVE
            );
          },
          onClose,
          MIME_TYPE_GROUPS[mimeType as keyof typeof MIME_TYPE_GROUPS],
          mimeType === "folder"
        );
      };

      func();
    });
  }, [showPicker, status, data]);
};

export default useGooglePicker;
