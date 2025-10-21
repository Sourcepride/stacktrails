"use client";

import CenterOnLgScreen from "@/common/utils/CenterOnLgScreen";
import { useAppStore } from "@/store";
import { PropsWithChildren } from "react";
import AppHeader from "./AppHeader";
import AppSideBar from "./AppSideBar";

type AppLayoutProps = PropsWithChildren;
const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const barIsOpen = useAppStore((state) => state.barIsOpen);
  return (
    <>
      <AppHeader />
      <AppSideBar />
      <main
        className={`w-full  ${
          barIsOpen && "w-full xl:w-[calc(100%-300px)]"
        }  ml-auto mt-[70px]`}
      >
        <CenterOnLgScreen
          {...{ component: "div" }}
          className="!px-0 !py-0 xl:!px-4"
        >
          {children}
        </CenterOnLgScreen>
      </main>
    </>
  );
};

export default AppLayout;
