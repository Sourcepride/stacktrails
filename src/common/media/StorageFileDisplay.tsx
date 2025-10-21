import { BACKEND_API_URL, DocumentPlatform } from "@/constants";
import { cacheKeys } from "@/lib/cacheKeys";
import {
  listProviders,
  listStorageProviders,
  listSubFolderAndFiles,
} from "@/lib/http/mediaFunc";
import { BackendRoutes } from "@/routes";
import { useAppStore } from "@/store";
import { CircularProgress, Modal, Tooltip } from "@mui/material";
import { BsArrowLeft } from "@react-icons/all-files/bs/BsArrowLeft";
import { FaPlus } from "@react-icons/all-files/fa/FaPlus";
import { GrStorage } from "@react-icons/all-files/gr/GrStorage";
import { IoClose } from "@react-icons/all-files/io5/IoClose";
import { IoGrid } from "@react-icons/all-files/io5/IoGrid";
import { IoList } from "@react-icons/all-files/io5/IoList";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import Empty from "../utils/Empty";
import LoadingComponent from "../utils/LoadingComponent";

type mime_ = "image" | "document" | "video" | "folder";
type callback_ = (file: FileResp, provider: DocumentPlatform) => void;

type StorageFileDisplayProps = {
  onClose: () => void;
  mimeType: mime_;
  provider?: DocumentPlatform;
  chosenFileHandler: callback_;
};

const StorageContext = createContext<{
  provider?: DocumentPlatform;
  setProvider: (provider?: DocumentPlatform) => void;
  isLoadingFiles: boolean;
  isLoadingProvider: boolean;
  setIsLoadingFile: (v: boolean) => void;
  setIsLoadingProvider: (v: boolean) => void;
  viewStyle: "list" | "grid";
  setViewStyle: (v: "list" | "grid") => void;
  onClose: () => void;
  callback: callback_;
  providersMap: { value: DocumentPlatform; name: string }[];
  validStorages: DocumentPlatform[];
  setValidStorages: (value: any) => void;
  mimeType: mime_;
}>({
  setProvider: () => {},
  callback: () => {},
  isLoadingFiles: false,
  isLoadingProvider: false,
  onClose: () => {},
  setIsLoadingFile: () => {},
  setIsLoadingProvider: () => {},
  setViewStyle: () => {},
  viewStyle: "grid",
  providersMap: [],

  setValidStorages: () => {},
  validStorages: [],
  mimeType: "document",
});

const StorageFileDisplay: React.FC<StorageFileDisplayProps> = ({
  onClose,
  provider,
  chosenFileHandler: callback,
  mimeType,
}) => {
  const [currentProvider, setCurrentProvider] = useState<
    DocumentPlatform | undefined
  >(provider);

  const [validStorages, setValidStorages] = useState<DocumentPlatform[]>([]);

  const [isLoadingFiles, setIsLoadingFile] = useState(false);
  const [isLoadingProvider, setIsLoadingProvider] = useState(false);
  const [viewStyle, setViewStyle] = useState<"grid" | "list">("grid"); //TODO: set in  store and persist
  const providersMap = useMemo(
    () => [
      { value: DocumentPlatform.GOOGLE_DRIVE, name: "Drive" },
      { value: DocumentPlatform.DROPBOX, name: "Drop box" },
    ],
    []
  );
  return (
    <Modal open={true} onClose={onClose}>
      <StorageContext
        value={{
          callback,
          isLoadingFiles,
          isLoadingProvider,
          onClose,
          setIsLoadingFile,
          setIsLoadingProvider,
          setViewStyle,
          viewStyle,
          provider: currentProvider,
          setProvider: setCurrentProvider,
          providersMap,
          validStorages,
          setValidStorages,
          mimeType,
        }}
      >
        <section className="w-[94%]  h-[460px] fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-background md:max-w-[600px]">
          <div className="absolute w-[74.5%]   right-3 bg-background  p-3 flex justify-end top-0">
            <button
              type={"button"}
              className="bg-red-400 rounded-full p-1"
              onClick={onClose}
            >
              <IoClose />
            </button>
          </div>
          <div className="flex w-full h-full">
            <SideBar />
            <div className="grow w-full h-full">
              {isLoadingProvider && <LoadingDisplay />}
              {!isLoadingProvider && (
                <>
                  {!currentProvider && <Platforms />}
                  {currentProvider && <ListFiles />}
                </>
              )}
            </div>
          </div>
        </section>
      </StorageContext>
    </Modal>
  );
};

export default StorageFileDisplay;

const ICON_MAP = {
  google_drive: "/icons8-drive.svg",
  dropbox: "/icons8-dropbox.svg",
};

function ListFiles() {
  const t = useTranslations();
  const [folderHistory, setFolderHistory] = useState<string[]>([]);
  const {
    validStorages,
    provider,
    callback,
    onClose,
    viewStyle,
    setViewStyle,
    mimeType: _mimeType,
  } = useContext(StorageContext);
  const currentFolder = folderHistory[folderHistory.length - 1] ?? "";

  const mimeType = _mimeType === "folder" ? "document" : _mimeType;
  const { data, status, error } = useQuery({
    queryKey: [cacheKeys.LIST_FOLDER_SUB_ITEMS, provider, currentFolder],
    queryFn: async () =>
      await listSubFolderAndFiles({
        params: {
          folder: currentFolder,
          mimeType: mimeType,
          provider: provider as any,
        },
      }),
    enabled: !!validStorages.find((v) => v === provider),
  });

  useEffect(() => {
    if (status === "error") {
      const err = error as AxiosError;
      if (
        err.response &&
        (err.response.data as any)?.detail?.error === "invalid_grant"
      ) {
        authRedirect(provider as DocumentPlatform);
      }
    }
  }, [status]);

  const onClick = (file: FileResp) => {
    if (_mimeType === "folder" && file.type === "folder") {
      callback(file, provider as any);
      onClose();
      return;
    }

    if (file.type === "folder")
      setFolderHistory((state) => [...state, file.id]);
    else {
      callback(file, provider as any);
      onClose();
    }
  };

  return (
    <section
      className={`w-full    h-full pt-24 px-4 rounded-r-xl  overflow-y-auto`}
    >
      <div className="p-4 absolute left-[23.5%] bg-background  w-[74%] top-10 flex items-center justify-between">
        {folderHistory.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() =>
                setFolderHistory(
                  folderHistory.filter((c) => c !== currentFolder)
                )
              }
            >
              <BsArrowLeft />
            </button>
          </div>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <FaPlus />
          {viewStyle === "list" && (
            <button type="button" onClick={() => setViewStyle("grid")}>
              <IoGrid />
            </button>
          )}
          {viewStyle === "grid" && (
            <button type="button" onClick={() => setViewStyle("list")}>
              <IoList />
            </button>
          )}
        </div>
      </div>

      {_mimeType !== "folder" && (
        <div className="text-xs text-center py-1  text-orange-500">
          {t("UPLOAD.PUBLIC_WARNING")}
        </div>
      )}
      <LoadingComponent
        loading={status === "pending"}
        data={data}
        empty={data && data.length < 1}
        error={status === "error"}
        loadingComponent={<LoadingDisplay />}
        emptyComponent={<Empty height={200} width={200} />}
      >
        {(cleanedData) => (
          <div
            className={` grid  gap-3 ${
              viewStyle === "grid" ? "grid-cols-3" : "grid-cols-1"
            }`}
          >
            {(_mimeType === "folder"
              ? cleanedData.filter((v) => v.type === "folder")
              : cleanedData
            ).map((value) => (
              <FileDisplay key={value.id} {...value} onClick={onClick} />
            ))}
          </div>
        )}
      </LoadingComponent>
    </section>
  );
}

function FileDisplay({
  id,
  name,
  type,
  onClick,
  mime_type,
  path,
  url,
}: FileResp & { onClick: (v: FileResp) => void }) {
  const { viewStyle } = useContext(StorageContext);
  return (
    <Tooltip title={name}>
      <button
        className={`flex  items-center  cursor-pointer ${
          viewStyle === "grid" ? "flex-col" : "flex-row gap-2"
        }`}
        type="button"
        onClick={() => onClick({ id, name, type, mime_type, path, url })}
      >
        {type === "folder" ? (
          <Image
            src={"/folder.svg"}
            width={40}
            height={40}
            alt="folder"
            className=""
          />
        ) : (
          <Image
            src={"/icons8-file.svg"}
            width={40}
            height={40}
            alt="folder"
            className=""
          />
        )}
        <div className="text-xs  line-clamp-1">
          {name.length > 12 && viewStyle === "grid"
            ? name.slice(0, 12) + "…"
            : name}
        </div>
      </button>
    </Tooltip>
  );
}

function SideBar() {
  const { user } = useAppStore((s) => s);
  const { data, status } = useQuery({
    queryKey: [cacheKeys.LIST_PROVIDERS, user?.id],
    queryFn: listStorageProviders,
  });

  const {
    provider,
    providersMap,
    setProvider,
    setIsLoadingProvider,
    setValidStorages,
  } = useContext(StorageContext);

  useEffect(() => {
    if (status !== "pending") {
      setIsLoadingProvider(false);
    }

    if (provider && status !== "pending" && data) {
      storageCheckOrRedirect(provider, data as any, () => {
        setProvider(provider);
        setValidStorages((state: any) => [...state, provider]);
      });
    }
  }, [status]);

  const handleSwitch = (value: DocumentPlatform | undefined) => {
    if (!value) {
      setProvider(value);
      return;
    }

    storageCheckOrRedirect(value, data as any, () => {
      setProvider(value);
      setValidStorages((state: any) => [...state, value]);
    });

    // list active providers
    //  if providers exists and scope needed exists
    // try getting files for user
    // if error show error message
    //  navigate to incremental with current page url as redirect
  };
  return (
    <aside className={`bg-gray-200 rounded-l-xl h-full  basis-[30%] px-2 py-2`}>
      <nav className="w-full h-full py-4 flex  text-sm flex-col gap-1">
        <button
          type="button"
          className={`w-full px-2 py-1 cursor-pointer flex rounded-md  items-center  gap-2 ${
            provider === undefined && "bg-secondary"
          } `}
          onClick={() => handleSwitch(undefined)}
        >
          <GrStorage />
          <div className="hidden md:block">Select</div>
        </button>

        {providersMap.map(({ name, value }) => (
          <button
            key={"sidebar__" + value}
            type="button"
            className={`w-full px-2 py-1 cursor-pointer flex rounded-md  items-center  gap-2 ${
              provider === value && "bg-secondary"
            } `}
            onClick={() => handleSwitch(value)}
          >
            <Image
              src={ICON_MAP[value as keyof typeof ICON_MAP]}
              alt={"icon"}
              height={24}
              width={24}
            />
            <div className="hidden md:block">{name}</div>
          </button>
        ))}
      </nav>
    </aside>
  );
}

function Platforms() {
  const t = useTranslations();
  const { providersMap, setProvider } = useContext(StorageContext);
  const { user } = useAppStore((s) => s);
  const { data, status } = useQuery({
    queryKey: [cacheKeys.LIST_PROVIDERS, user?.id],
    queryFn: listProviders,
  });

  const clickHandler = (value: DocumentPlatform) => {
    storageCheckOrRedirect(value, data as any, () => setProvider(value));
  };

  return (
    <section className="h-full flex flex-col justify-center">
      <h2 className="text-lg text-center py-2 font-bold">
        {t("STORAGE.SELECT_STORAGE")}
      </h2>
      <div className="flex h-full items-center  justify-center  gap-8">
        {providersMap.map(({ value, name }) => (
          <button
            key={"platforms__" + value}
            type="button"
            className="flex flex-col items-center gap-1 cursor-pointer"
            onClick={() => clickHandler(value)}
          >
            <div className={`rounded-md p-2  border border-gray-200`}>
              <Image
                src={ICON_MAP[value as keyof typeof ICON_MAP]}
                alt={"icon"}
                height={40}
                width={40}
              />
            </div>
            <p className="">{name}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

function storageCheckOrRedirect(
  value: DocumentPlatform,
  data: ProviderList,
  callback: () => void
) {
  switch (value) {
    case DocumentPlatform.GOOGLE_DRIVE: {
      const storageExists = data?.items?.find?.(
        (e) =>
          e.provider === "google" &&
          !!e.scopes?.includes("https://www.googleapis.com/auth/drive")
      );

      if (storageExists) {
        callback?.();
        return;
      }

      authRedirect(DocumentPlatform.GOOGLE_DRIVE);

      return;
    }

    case DocumentPlatform.DROPBOX: {
      const storageExists = data?.items?.find?.(
        (e) =>
          e.provider === "dropbox" &&
          !!e.scopes?.includes("files.metadata.read") &&
          !!e.scopes?.includes("files.metadata.write")
      );

      if (storageExists) {
        callback?.();
        return;
      }

      authRedirect(DocumentPlatform.DROPBOX);
      return;
    }

    default:
      return;
  }

  // try and get provider token
  // if provider exists navigate to specific
  // else push to incremental authorization with callback url as current href
}

function LoadingDisplay() {
  const t = useTranslations("LOADING");
  return (
    <div className="h-full flex flex-col justify-center items-center gap-4">
      <CircularProgress />
      <div>{t("PLEASE_WAIT")}</div>
    </div>
  );
}

function authRedirect(platform: DocumentPlatform) {
  let url: URL = null as any;

  switch (platform) {
    case DocumentPlatform.GOOGLE_DRIVE:
      {
        url = new URL(BACKEND_API_URL + BackendRoutes.GOOGLE_INCREMENTAL);
        url.searchParams.append(
          "required_scopes",
          "openid email profile https://www.googleapis.com/auth/drive"
        );
      }
      break;
    case DocumentPlatform.DROPBOX:
      {
        url = new URL(BACKEND_API_URL + BackendRoutes.DROPBOX_AUTH);
      }
      break;
  }

  if (!url) return;

  url.searchParams.append("redirect", location.href);
  location.href = url.toString();
}
