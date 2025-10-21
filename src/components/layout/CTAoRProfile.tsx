"use client";

import { Link } from "@/i18n/navigation";
import { PublicRoutes } from "@/routes";
import { useAppStore } from "@/store";
import { Button, IconButton } from "@mui/material";
import { FaBars } from "@react-icons/all-files/fa/FaBars";
import { useTranslations } from "next-intl";
import Profile from "./Profile";

export default function CTAORProfie() {
  const user = useAppStore((state) => state.user);
  const toggleBar = useAppStore((state) => state.toggleBar);
  const t = useTranslations("PUBLIC_HEADER");

  return (
    <>
      {/* Hamburger menu - only visible on mobile */}
      <div className="lg:hidden">
        <IconButton
          onClick={() => toggleBar({})}
          sx={{ color: "inherit" }}
          aria-label="Toggle menu"
        >
          <FaBars size={24} />
        </IconButton>
      </div>
      {!user && (
        <>
          <Link href={PublicRoutes.REGISTER} className="hidden md:inline-block">
            <Button
              size="large"
              variant="text"
              color="inherit"
              sx={{ textTransform: "capitalize" }}
            >
              {t("REGISTER")}
            </Button>
          </Link>
          <Link href={PublicRoutes.LOGIN} className="hidden md:inline-block">
            <Button
              size="large"
              sx={{ borderRadius: "20px", textTransform: "capitalize" }}
            >
              {t("LOGIN")}
            </Button>
          </Link>
        </>
      )}

      {user && (
        <div>
          <Profile />
        </div>
      )}
    </>
  );
}
