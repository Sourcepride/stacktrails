"use client";

import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { CiGlobe } from "@react-icons/all-files/ci/CiGlobe";
import CountryList from "country-list-with-dial-code-and-flag";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

const AVAILABLE_LOCALES = ["en", "de", "es", "fr"];

// Map locales to their corresponding country codes
const LOCALE_TO_COUNTRY: Record<string, string> = {
  en: "US", // English - United States
  de: "DE", // German - Germany
  es: "ES", // Spanish - Spain
  fr: "FR", // French - France
};

export default function LanguageSelector() {
  const t = useTranslations("LANGUAGE_SELECT");
  const router = useRouter();
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Force re-render when pathname changes
  const [key, setKey] = useState(0);

  useEffect(() => {
    setKey((prev) => prev + 1);
  }, [pathname]);

  const LOCALE_LABELS: Record<string, string> = useMemo(
    () => ({
      en: t("ENGLISH"),
      fr: t("FRENCH"),
      es: t("SPANISH"),
      de: t("GERMAN"),
    }),
    [t, key] // Add key as dependency to force re-computation
  );

  const countries = useMemo(() => CountryList.getAll(), []);
  const currentLocale = pathname.split("/")[1] || "en";
  const open = Boolean(anchorEl);

  const onOpen = (e: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);
  const onClose = () => setAnchorEl(null);

  function buildNewPath(targetLocale: string) {
    const parts = pathname.split("/");
    if (parts[1] && AVAILABLE_LOCALES.includes(parts[1])) {
      parts[1] = targetLocale;
      return parts.join("/") || `/${targetLocale}`;
    }
    // no locale segment present, prefix it
    const p = pathname === "/" ? "" : pathname;
    return `/${targetLocale}${p}`;
  }

  const handleSelect = (locale: string) => {
    onClose();
    if (locale === currentLocale) return;

    const newPath = buildNewPath(locale);
    const qs = searchParams?.toString();

    // Option 1: Use window.location for hard navigation (forces re-render)
    const fullUrl = qs ? `${newPath}?${qs}` : newPath;
    window.location.href = fullUrl;

    // Option 2: Alternative - use router.push with refresh
    // router.push(qs ? `${newPath}?${qs}` : newPath);
    // router.refresh();
  };

  return (
    <>
      <IconButton
        aria-label={t("CHANGE_LANGUAGE")}
        onClick={onOpen}
        size="large"
        color="inherit"
      >
        <CiGlobe />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={onClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        slotProps={{
          paper: {
            sx: {
              transform: "translateX(-160px)",
            },
          },
        }}
      >
        {AVAILABLE_LOCALES.map((loc) => {
          const countryCode = LOCALE_TO_COUNTRY[loc];
          const countryData = countries.find(
            (country) => country.code === countryCode
          );
          const flag = countryData?.flag;

          return (
            <MenuItem
              key={loc}
              selected={loc === currentLocale}
              onClick={() => handleSelect(loc)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              {flag && <span style={{ fontSize: "1.2em" }}>{flag}</span>}
              {LOCALE_LABELS[loc] ?? loc}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}
