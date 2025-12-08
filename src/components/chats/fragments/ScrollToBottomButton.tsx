import { Fab } from "@mui/material";
import { FaAngleDown } from "@react-icons/all-files/fa/FaAngleDown";

type NewerMessagesInfo = {
  count: number;
  hasReply: boolean;
};

type ScrollToBottomButtonProps = {
  show: boolean;
  onClick: () => void;
  newerMessages: NewerMessagesInfo | null;
};

export default function ScrollToBottomButton({
  show,
  onClick,
  newerMessages,
}: ScrollToBottomButtonProps) {
  if (!show) return null;

  return (
    <div className="absolute bottom-[80px] right-4">
      <div className="relative">
        <Fab
          size="medium"
          onClick={onClick}
          aria-label="Scroll to bottom"
          sx={{
            backgroundColor: (theme) => theme?.vars?.palette.primary.main,
            color: "#fff",
            boxShadow: 3,
            "&:hover": {
              backgroundColor: "#1e6cbb",
            },
            zIndex: 2,
          }}
        >
          <FaAngleDown size={20} />
        </Fab>

        {/* Message count badge */}
        {newerMessages && (
          <div
            className="absolute -top-1 -right-1 min-w-[20px] z-10 h-5 px-1.5 bg-[#1e1e1e] rounded-full flex items-center justify-center"
            role="status"
            aria-label={`${newerMessages.count} new ${
              newerMessages.count === 1 ? "message" : "messages"
            }`}
          >
            <span className="text-xs font-bold text-white">
              {newerMessages.hasReply ? "@" : newerMessages.count}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

