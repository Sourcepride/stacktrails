"use client";

import { Link } from "@/i18n/navigation";
import { PublicRoutes } from "@/routes";
import { useAppStore } from "@/store";
import { FaBars } from "@react-icons/all-files/fa/FaBars";
import Image from "next/image";
import AppNotification from "../notification/AppNotification";
import LanguageSelector from "./LanguageSelector";
import Profile from "./Profile";

type AppHeaderProps = {};
const AppHeader: React.FC<AppHeaderProps> = ({}) => {
  const { barIsOpen, toggleBar } = useAppStore((state) => state);

  return (
    <header
      className={`flex fixed top-0 right-0 gap-4 z-50  items-center px-4 h-[70px] border-b bg-background border-b-base py-4 md:px-8 xl:px-10 ${
        !barIsOpen ? "w-full" : "w-full xl:w-[calc(100%-300px)]"
      }`}
    >
      <button
        type="button"
        className="[appearance:none] cursor-pointer"
        onClick={() => toggleBar({})}
      >
        <FaBars />
      </button>

      <Link href={PublicRoutes.HOME} className="flex items-baseline xl:hidden">
        <Image src="/black-logo.svg" alt="Logo" width={30} height={30} />
        <h1 className="hidden font-bold text-2xl -translate-1 md:block">
          tackTrails
        </h1>
      </Link>
      {/*  bar ->  logo -> profile pic */}
      {/* large screen add notification icon */}

      <div className="ml-auto flex items-center gap-4">
        <div className="translate-x-2 ">
          <LanguageSelector />
        </div>
        <AppNotification />
        <Profile />
      </div>
    </header>
  );
};

export default AppHeader;
