import { Modal } from "@mui/material";
import { AvailableSources } from "./media.constants";
import UploadFile from "./UploadFile";

type UploadFileModalProps = {
  accept: AvailableSources[];
  mimeType?: "video" | "document" | "image";
  callback: (url: string, provider: AvailableSources) => void;

  onClose: () => void;
};
const UploadFileModal: React.FC<UploadFileModalProps> = ({
  onClose,
  ...props
}) => {
  return (
    <Modal open onClose={onClose}>
      <section className="w-[95%] max-w-[580px]  p-4 bg-background fixed top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2  rounded-xl  z-50">
        <UploadFile
          {...props}
          callback={(url, provider) => {
            props.callback(url, provider);
            onClose();
          }}
        />
      </section>
    </Modal>
  );
};

export default UploadFileModal;
