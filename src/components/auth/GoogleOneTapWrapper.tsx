"use client";

import { appToast } from "@/lib/appToast";
import { googleOneTapForm } from "@/lib/utils";
import { useAppStore } from "@/store";
import { useGoogleOneTapLogin } from "@react-oauth/google";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

export default function GoogleOneTapWrapper() {
  const { user, isLoading } = useAppStore((state) => state);
  const locale = useLocale();
  const nextRaw = useSearchParams().get("next") || `/${locale}`;

  const next = fullURL(nextRaw)
    ? fullURL(nextRaw)?.pathname ?? `/${locale}` + fullURL(nextRaw)?.search
    : nextRaw;

  const t = useTranslations("GOOGLE_AUTH_MESSAGES.ERRORS");
  useGoogleOneTapLogin({
    onSuccess: (credentialResponse) => {
      if (credentialResponse.credential) {
        // Create and submit form
        googleOneTapForm(credentialResponse.credential, next);
      } else appToast.Error(t("ERROR_LOGIN"));
    },
    onError: () => {
      appToast.Error(t("ERROR_LOGIN"));
    },
    disabled: isLoading || !!user,
  });

  return <></>;
}

function fullURL(str: string): URL | undefined {
  try {
    return new URL(str);
  } catch {
    return undefined;
  }
}
