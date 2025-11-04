import useGooglePicker from "@/common/media/picker/useGooglePicker";
import { DocumentPlatform } from "@/constants";
import GeneralStoragePicker from "./picker/GeneralStoragePicker";

type mime_ = "image" | "document" | "video" | "folder";
type callback_ = (file: FileResp, provider: DocumentPlatform) => void;

type StorageFileDisplayProps = {
  onClose: () => void;
  mimeType: mime_;
  provider?: DocumentPlatform;
  chosenFileHandler: callback_;
};

const StorageFileDisplay: React.FC<StorageFileDisplayProps> = ({
  onClose,
  provider,
  chosenFileHandler: callback,
  mimeType,
}) => {
  useGooglePicker({
    showPicker: provider === DocumentPlatform.GOOGLE_DRIVE,
    onClose,
    onPick: callback,
    mimeType,
  });

  if (provider !== DocumentPlatform.GOOGLE_DRIVE)
    return (
      <GeneralStoragePicker
        onClose={onClose}
        provider={provider}
        chosenFileHandler={callback}
        mimeType={mimeType}
      />
    );

  return <></>;
};

export default StorageFileDisplay;
