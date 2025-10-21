import { AvailableSources } from "@/common/media/media.constants";
import UploadFile from "@/common/media/UploadFile";
import ConfirmPopup from "@/common/popups/ComfirmPop";
import LoadingModal from "@/common/popups/LoadingModal";
import Empty from "@/common/utils/Empty";
import LoadingComponent from "@/common/utils/LoadingComponent";
import { appToast } from "@/lib/appToast";
import appAxios from "@/lib/axiosClient";
import { cacheKeys } from "@/lib/cacheKeys";
import { extractExternalId } from "@/lib/utils";
import { BackendRoutes } from "@/routes";
import { useAppStore } from "@/store";
import { Button, IconButton, Modal } from "@mui/material";
import { FaTrash } from "@react-icons/all-files/fa/FaTrash";
import { IoClose } from "@react-icons/all-files/io5/IoClose";
import { IoTrashBin } from "@react-icons/all-files/io5/IoTrashBin";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";

type AttachmentsProps = {
  data: FullModule;
  onClose: () => void;
};

const Attachments: React.FC<AttachmentsProps> = ({ data, onClose }) => {
  const query = useQuery({
    queryKey: [cacheKeys.MODULE_DETAIL_PAGE, data.id],
    queryFn: async (): Promise<FullModule> => {
      const res = await appAxios.get<any>(
        BackendRoutes.GET_FULL_MODULE(data.id)
      );

      return res.data;
    },
    initialData: data,
  });

  const { data: respData, error } = query;

  const t = useTranslations();
  const [selectedDocument, setSelectedDocument] = useState<string>("");
  const [openCreate, setOpenCreate] = useState(false);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (id: string) => {
      const { data: resp } = await appAxios.delete(
        BackendRoutes.REMOVE_ATTACHMENT(id)
      );

      return resp;
    },
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: [cacheKeys.COURSE_DETAIL, data.section_id],
      });
      queryClient.invalidateQueries({
        queryKey: [cacheKeys.MODULE_DETAIL_PAGE, data.id],
      });
      appToast.Success(t("MODULE.ATTACHMENT_REMOVED"));
      setSelectedDocument("");
    },
    onError() {
      appToast.Error(t("MODULE.ERROR_REMOVING_ATTACHMENT"));
    },
  });

  return (
    <>
      {/* Attachments Modal */}
      <Modal open onClose={onClose}>
        <section
          className="absolute top-1/2 left-1/2 w-[96%] max-w-[800px] h-[480px] overflow-y-auto bg-white rounded-2xl shadow-lg p-4"
          style={{ transform: "translate(-50%, -50%)" }}
        >
          <LoadingComponent
            loading={false}
            data={respData}
            empty={false}
            error={!!error}
          >
            {(updatedData) => (
              <>
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">
                    {t("MODULE.ATTACHMENTS")}
                  </h2>
                  <IconButton onClick={onClose} size="small">
                    <IoClose size={25} />
                  </IconButton>
                </div>

                {/* Create Attachment Button */}
                <div className="mb-4 flex justify-end">
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => setOpenCreate(true)}
                    className="!capitalize"
                  >
                    {t("MODULE.CREATE_ATTACHMENT")}
                  </Button>
                </div>

                {!updatedData.attachments.length && (
                  <div className="h-28">
                    <Empty
                      title={t("EMPTY")}
                      message={t("MODULE.NO_ATTACHMENT")}
                      width={200}
                      height={200}
                    />
                  </div>
                )}

                {/* Attachments Grid */}
                <ul className="grid  gap-4">
                  {updatedData.attachments.map((attachment, i) => (
                    <li
                      key={i}
                      className="p-3 border border-gray-300 rounded-lg flex justify-between shadow-sm bg-white"
                    >
                      <div>
                        <a
                          className="font-medium underline text-blue-500"
                          target="_blank"
                          href={attachment.file_url}
                        >
                          {attachment.title} {i + 1}
                        </a>
                        <p className="text-sm text-gray-500">
                          {attachment.attachment_type}
                        </p>
                      </div>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        className="mt-3"
                        onClick={() => setSelectedDocument(attachment.id)}
                      >
                        <FaTrash />
                      </Button>
                    </li>
                  ))}
                </ul>
                {isPending && <LoadingModal />}
                {
                  <ConfirmPopup
                    body={t("MODULE.DELETE_DOCUMENT")}
                    header={t("CONFIRM_DELETE")}
                    close={() => setSelectedDocument("")}
                    isOpen={!!selectedDocument}
                    proceedCallback={() => mutate(selectedDocument)}
                    cancelText={t("CANCEL_TEXT")}
                    proceedText={t("PROCEED_DELETE")}
                    icon={<IoTrashBin />}
                  />
                }
              </>
            )}
          </LoadingComponent>
        </section>
      </Modal>

      {/* CreateAttachment Modal */}
      {openCreate && (
        <CreateAttachment module={data} onClose={() => setOpenCreate(false)} />
      )}
    </>
  );
};

export default Attachments;

function CreateAttachment({
  module,
  onClose,
}: {
  module: FullModule;
  onClose: () => void;
}) {
  const { user } = useAppStore((state) => state);
  const [attachment, setAttachment] = useState<
    CreateAttachmentContent | undefined
  >();
  const [error, setError] = useState("");
  const t = useTranslations();

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: CreateAttachmentContent) => {
      const { data: resp } = await appAxios.post(
        BackendRoutes.CREATE_ATTACHMENT,
        {
          data: [data],
        }
      );

      return resp;
    },
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: [cacheKeys.COURSE_DETAIL, module.section_id, user?.id],
      });
      queryClient.invalidateQueries({
        queryKey: [cacheKeys.MODULE_DETAIL_PAGE, module.id],
      });
      appToast.Success(t("MODULE.ATTACHMENT_SAVED"));
      onClose();
    },
    onError() {
      appToast.Error(t("MODULE.ERROR_SAVING_ATTACHMENT"));
    },
  });

  const { mutate: validate, isPending: isValidating } = useMutation({
    mutationFn: async (
      data: Omit<DocumentItem, "provider"> & {
        provider: "google_drive" | "dropbox";
      }
    ): Promise<DocumentValidationResponse> => {
      const { data: resp } = await appAxios.post(
        BackendRoutes.VALIDATE_DOCUMENT,
        {
          ...data,
          provider: data.provider,
        }
      );

      return resp;
    },
    onSuccess(data, variables) {
      setAttachment({
        attachment_type: "document",
        title: variables.file_name || "document",
        document_type: variables.provider,
        module_id: module.id,
        embed_url: data.embed_url,
        external_file_id:
          extractExternalId(
            variables.provider as any,
            data.direct_url || data.embed_url || variables.url
          ) || crypto.randomUUID(),
        file_url: data.direct_url || variables.url,

        file_type: data.media_type || variables.media_type,
      });
    },
    onError(error, variables, context) {
      setError(t("PROCESSING_FAILED"));
    },
  });

  const handleAttachFile = (url: string, provider: AvailableSources) => {
    if (provider === "link") {
      return setAttachment({
        attachment_type: "external_link",
        title: "link",
        document_type: "direct_link",
        module_id: module.id,
        file_url: url,
      });
    }

    validate({
      url,
      media_type: "document",
      provider: provider === "drop_box" ? "dropbox" : "google_drive",
    });
  };

  return (
    <Modal open onClose={onClose}>
      <section
        className="absolute top-1/2 left-1/2 w-[500px] bg-white rounded-2xl shadow-lg p-4"
        style={{ transform: "translate(-50%, -50%)" }}
      >
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">
            {" "}
            {t("MODULE.CREATE_ATTACHMENT")}
          </h2>
          <IconButton onClick={onClose} size="small">
            <IoClose size={25} />
          </IconButton>
        </div>

        {/* Placeholder: expand later into a form */}

        {isValidating && (
          <div className="text-orange-500 font-bold  text-sm">
            {t("MODULE.CREATING_ATTACHMENT")} <strong>{module.title}</strong>
          </div>
        )}
        {error && (
          <div className="text-red-500 font-bold  text-sm">{error}</div>
        )}

        {attachment && (
          <div className="flex gap-4 px-6 py-2 border  items-center text-gray-600 rounded-md w-full">
            <div className="grow">{attachment.title}</div>
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={() => setAttachment(undefined)}
              className="!capitalize"
            >
              <IoClose />
            </Button>
          </div>
        )}
        {!attachment && (
          <div
            className={`${isValidating && "!pointer-events-none !opacity-50"}`}
          >
            <UploadFile
              accept={["google_drive", "drop_box", "link"]}
              callback={handleAttachFile}
              mimeType="document"
            />
          </div>
        )}

        <div className="mt-4">
          <Button
            variant="contained"
            color="primary"
            disabled={!attachment}
            className="!capitalize"
            onClick={() => mutate(attachment as any)}
          >
            {t("MODULE.SAVE_ATTACHMENT")}
          </Button>
        </div>
        {isPending && <LoadingModal />}
      </section>
    </Modal>
  );
}
