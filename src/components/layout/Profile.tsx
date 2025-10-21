"use client";

import { Link } from "@/i18n/navigation";
import { AppRoutes, BackendRoutes, PublicRoutes } from "@/routes";
import { useAppStore } from "@/store";
import { BsBackpack2Fill } from "@react-icons/all-files/bs/BsBackpack2Fill";
import { BsPassportFill } from "@react-icons/all-files/bs/BsPassportFill";
import { GiScrollQuill } from "@react-icons/all-files/gi/GiScrollQuill";
import { IoIosStats } from "@react-icons/all-files/io/IoIosStats";
import { IoLogOutOutline } from "@react-icons/all-files/io5/IoLogOutOutline";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { appFetch } from "@/lib/appFetch";
import { appToast } from "@/lib/appToast";
import { Avatar } from "@mui/material";
import type { ReactNode } from "react";

type ProfileLink = {
  href: string;
  label: string;
  icon?: ReactNode;
};

type ProfileProps = {
  className?: string;
};

const LINKS = [
  {
    href: AppRoutes.DASHBOARD,
    label: "DASHBOARD",
    icon: <IoIosStats size={"18"} />,
  },
  {
    href: AppRoutes.ENROLLED,
    label: "ENROLLED",
    icon: <BsBackpack2Fill size={"18"} />,
  },
  {
    href: AppRoutes.ACCOUNT,
    label: "PROFILE",
    icon: <BsPassportFill size={"18"} />,
  },
  {
    href: AppRoutes.CREATED,
    label: "CREATED",
    icon: <GiScrollQuill size={"18"} />,
  },
];

export default function Profile({ className }: ProfileProps) {
  const { currentProfile, user } = useAppStore((state) => state);
  const t = useTranslations("NAVS");
  const [isOpen, setIsOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    try {
      const response = await appFetch(BackendRoutes.LOGOUT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Close the menu
        setIsOpen(false);
        // Redirect to login page or home page
        window.location.href = PublicRoutes.LOGIN;
      } else {
        appToast.Error("Logout failed");
      }
    } catch (error) {
      appToast.Error("Error during logout");
    }
  };

  return (
    <div
      ref={profileRef}
      className={`relative inline-block ${className ?? ""}`}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-label="Open profile menu"
        aria-expanded={isOpen}
        onClick={toggleMenu}
        className="h-12 w-12 rounded-full overflow-hidden ring-1 ring-black/10 hover:ring-black/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <Avatar
          src={currentProfile?.avatar}
          alt={"profile pic"}
          sx={{
            width: "48px",
            height: "48px",
            background: (theme) => theme.palette.accentColor.main,
            fontSize: "1rem",
            fontWeight: "900",
          }}
        >
          {user?.username?.substring(0, 2)?.toUpperCase()}
        </Avatar>
      </button>

      <div
        role="menu"
        className={`absolute right-0 mt-2 w-64 rounded-xl border border-black/7 bg-white shadow-xl shadow-black/5 transition-all duration-150 z-50 ${
          isOpen
            ? "opacity-100 pointer-events-auto translate-y-0"
            : "opacity-0 pointer-events-none translate-y-1"
        }`}
      >
        <ul className="py-2">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-black/80 hover:bg-primary/5 hover:text-neutral-black focus:bg-primary/10 focus:outline-none rounded-lg mx-2"
              >
                {(link as any)?.icon ? (
                  <span className="text-neutral-black/70">
                    {(link as any).icon}
                  </span>
                ) : null}
                <span>{t(link.label)}</span>
              </Link>
            </li>
          ))}

          {/* Divider */}
          <li>
            <div className="border-t border-neutral-black/10 my-2 mx-2"></div>
          </li>

          {/* Logout Button */}
          <li className="px-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 focus:bg-red-100 focus:outline-none rounded-lg w-full text-left"
            >
              <span className="text-red-500">
                <IoLogOutOutline size="18" />
              </span>
              <span>{t("LOGOUT")}</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
