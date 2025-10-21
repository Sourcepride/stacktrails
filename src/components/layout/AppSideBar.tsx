"use client";

import { useWindowWidth } from "@/hooks/useWindowWidth";
import { Link, usePathname } from "@/i18n/navigation";
import { AppRoutes } from "@/routes";
import { useAppStore } from "@/store";
import { BsBackpack2Fill } from "@react-icons/all-files/bs/BsBackpack2Fill";
import { BsPassportFill } from "@react-icons/all-files/bs/BsPassportFill";
import { GiScrollQuill } from "@react-icons/all-files/gi/GiScrollQuill";
import { MdDashboard } from "@react-icons/all-files/md/MdDashboard";
import { useTranslations } from "next-intl";
import Image from "next/image";

type AppSideBarProps = {};

const LINKS = [
  {
    href: AppRoutes.DASHBOARD,
    label: "DASHBOARD",
    icon: <MdDashboard size={"24"} />,
  },
  {
    href: AppRoutes.ENROLLED,
    label: "ENROLLED",
    icon: <BsBackpack2Fill size={"22"} />,
  },
  {
    href: AppRoutes.CREATED,
    label: "CREATED",
    icon: <GiScrollQuill size={"22"} />,
  },
  {
    href: AppRoutes.ACCOUNT,
    label: "PROFILE",
    icon: <BsPassportFill size={"22"} />,
  },
];

const AppSideBar: React.FC<AppSideBarProps> = ({}) => {
  const t = useTranslations("NAVS");
  const { barIsOpen, toggleBar } = useAppStore((state) => state);

  useWindowWidth({
    callback(width) {
      if (width > 1220) {
        toggleBar({ val: true });
      }
    },
  });

  return (
    <>
      {barIsOpen && (
        <div
          onClick={() => toggleBar({})}
          className="fixed inset-0 bg-[rgba(0,0,0,0.5)]  z-40 xl:hidden"
        />
      )}
      <aside
        className={`fixed py-4 z-50 top-0 w-[300px] h-screen bg-[#061D33] text-white transform transition-all duration-300 ease-in-out
    ${barIsOpen ? "left-0" : "-left-full"}
  `}
      >
        <div className="px-12 w-full py-4">
          <Link href={"/"} className="flex items-baseline">
            <Image src="/white-logo.svg" alt="Logo" width={60} height={60} />
            <h1 className="hidden font-bold text-2xl -translate-1 md:block">
              tackTrails
            </h1>
          </Link>
        </div>

        <nav className="mt-8">
          <ul className="px-2">
            {LINKS.map(({ href, icon, label }) => (
              <li key={"side__nav__" + label} className="mb-2">
                <SideBtn icon={icon} text={t(label)} path={href} />
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default AppSideBar;

type SideBtnProps = {
  text: string;
  path: string;
  icon: React.ReactNode;
};
const SideBtn: React.FC<SideBtnProps> = ({ text, path, icon }) => {
  const pathname = usePathname();

  return (
    <Link
      href={path}
      className={`px-4 py-4 flex items-center gap-4 rounded-md ${
        pathname === path && "bg-[#030E19]"
      } hover:bg-[#030E19]`}
    >
      <div>{icon}</div>
      <div>{text}</div>
    </Link>
  );
};
