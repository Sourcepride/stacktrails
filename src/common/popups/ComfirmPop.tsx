"use client";

import { Button } from "@mui/material";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import { FaEdit } from "@react-icons/all-files/fa/FaEdit";
import { useTranslations } from "next-intl";
import * as React from "react";

type props = {
  proceedText?: string;
  proceedCallback: () => void;
  close: () => void;
  isOpen: boolean;
  header: React.ReactNode;
  body: React.ReactNode;
  cancelText?: string;
  icon?: React.ReactNode;
  color?: string;
  className?: string;
};

const ConfirmPopup: React.FC<props> = ({
  body,
  close,
  header,
  isOpen,
  proceedCallback,
  cancelText: cancelTxt,
  proceedText: proceedTxt,
  icon = <FaEdit />,
  color,
  className,
}) => {
  const t = useTranslations("POPUP");
  const cancelText = cancelTxt || t("NO_CANCEL");
  const proceedText = proceedTxt || t("YES_PROCEED");
  return (
    <div>
      <Modal
        open={isOpen}
        onClose={close}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <div
          className={`fixed left-1/2 top-1/2 flex w-[94%] max-w-[360px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-4 rounded-xl bg-white p-4 py-5 ${className}`}
        >
          {/* <img src={bin} className="w-12" alt="bin" /> */}
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EAEAEA]">
            {icon}
          </div>
          <Typography
            id="modal-modal-title"
            sx={{
              fontWeight: "bold",
              fontSize: "16px !important",
              textAlign: "center",
            }}
            variant="h4"
          >
            {header}
          </Typography>
          <Typography
            id="modal-modal-description"
            sx={{
              fontWeight: "500",
              color: "#595959",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            {body}
          </Typography>
          <div className="flex w-full items-center justify-center gap-4 self-start border-t border-[#F1F2F3] pt-4">
            <Button
              color="inherit"
              onClick={close}
              sx={{
                color: "black",
                borderColor: "rgba(0,0,0,0.2)",
              }}
              variant="outlined"
            >
              {cancelText}
            </Button>
            <Button
              onClick={proceedCallback}
              sx={{
                borderColor: { color },
                backgroundColor: { color },
              }}
            >
              {proceedText}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ConfirmPopup;
