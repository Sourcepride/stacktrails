"use client";

import { Link } from "@/i18n/navigation";
import { AppRoutes, PublicRoutes } from "@/routes";
import { useAppStore } from "@/store";
import { Button } from "@mui/material";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

const Sidebar = () => {
  const barIsOpen = useAppStore((state) => state.barIsOpen);
  const toggleBar = useAppStore((state) => state.toggleBar);
  const user = useAppStore((state) => state.user);
  const t = useTranslations("PUBLIC_HEADER");

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById("sidebar");
      const hamburger = document.querySelector('[aria-label="Toggle menu"]');

      if (
        barIsOpen &&
        sidebar &&
        !sidebar.contains(event.target as Node) &&
        !hamburger?.contains(event.target as Node)
      ) {
        toggleBar({});
      }
    };

    if (barIsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Prevent body scroll when sidebar is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [barIsOpen, toggleBar]);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && barIsOpen) {
        toggleBar({});
      }
    };

    if (barIsOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [barIsOpen, toggleBar]);

  return (
    <>
      {/* Backdrop */}
      {barIsOpen && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.6)]  z-40 lg:hidden" />
      )}

      {/* Sidebar */}
      <div
        id="sidebar"
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 lg:hidden ${
          barIsOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-end p-6 ">
            <button
              onClick={() => toggleBar({})}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6">
            <ul className="space-y-4">
              {[
                { href: PublicRoutes.ABOUT, label: t("ABOUT") },
                { href: PublicRoutes.COURSES, label: t("EXPLORE") },
                { href: PublicRoutes.PAID_COURSES, label: t("PAID_COURSES") },
                { href: AppRoutes.CREATE_COURSE, label: t("CREATE") },
              ].map((item, idx) => (
                <li key={idx}>
                  <Link
                    href={item.href}
                    className="block py-3 px-4 text-gray-700 hover:text-accent hover:bg-gray-50 rounded-lg transition-colors duration-200"
                    onClick={() => toggleBar({})}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Auth Buttons */}
          <div className="p-6 border-t">
            {!user ? (
              <div className="space-y-3">
                <Link href={PublicRoutes.REGISTER} className="block">
                  <Button
                    fullWidth
                    variant="text"
                    color="inherit"
                    sx={{ textTransform: "capitalize" }}
                    onClick={() => toggleBar({})}
                  >
                    {t("REGISTER")}
                  </Button>
                </Link>
                <Link href={PublicRoutes.LOGIN} className="block">
                  <Button
                    fullWidth
                    sx={{ borderRadius: "20px", textTransform: "capitalize" }}
                    onClick={() => toggleBar({})}
                  >
                    {t("LOGIN")}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-600 mb-3">Welcome back!</p>

                <Link href={AppRoutes.DASHBOARD} className="block">
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => toggleBar({})}
                  >
                    Go to Dashboard
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
