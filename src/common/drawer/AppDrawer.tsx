import { Drawer, DrawerProps, styled } from "@mui/material";
import { IoClose } from "@react-icons/all-files/io5/IoClose";
import { IoEyeOutline } from "@react-icons/all-files/io5/IoEyeOutline";
import { PropsWithChildren } from "react";

type props = {
  isOpen: boolean;
  icon?: React.ReactNode;
  iconText?: string;
  topBorder?: boolean;
  wrapperStyle?: Record<string, any>;
  close: () => void;
} & PropsWithChildren;

const CustomDrawer = styled((props: DrawerProps) => <Drawer {...props} />)(
  ({}) => ({
    "& .MuiPaper-root": {
      borderRadius: "0.75rem 0 0 0.75rem",
    },
  })
);

const AppDrawer: React.FC<props> = ({
  close,
  isOpen,
  children,
  icon = <IoEyeOutline size={22} />,
  iconText = "View Details",
  topBorder = false,
  wrapperStyle = {},
}) => {
  return (
    <CustomDrawer anchor={"right"} open={isOpen} onClose={close}>
      <div className="h-full w-screen bg-white lg:w-[480px]">
        <div
          className={`flex h-11 items-center justify-between ${
            topBorder ? "border-b" : ""
          } px-4`}
        >
          <div className="flex items-center gap-1">
            {icon}
            <span className="font-bold">{iconText}</span>
          </div>
          <button className="[appearance:none]" onClick={close}>
            <IoClose size={20} />
          </button>
        </div>
        <div
          className="flex h-[calc(100%-2.75rem)] flex-col gap-4 overflow-y-auto"
          style={wrapperStyle}
        >
          {children}
        </div>
      </div>
    </CustomDrawer>
  );
};

export default AppDrawer;
