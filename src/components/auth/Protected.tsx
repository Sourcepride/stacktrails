"use client";

import Loading from "@/app/[locale]/(public)/loading";
import { useRouter } from "@/i18n/navigation";
import { PublicRoutes } from "@/routes";
import { useAppStore } from "@/store";
import { PropsWithChildren, useEffect } from "react";

export default function Protected({ children }: PropsWithChildren) {
  const { user, isLoading } = useAppStore((state) => state);
  const router = useRouter();
  const loadingComp = (
    <div className="w-screen  h-screen grid place-items-center">
      <Loading />
    </div>
  );

  useEffect(() => {
    if (!user && !isLoading) {
      router.replace(PublicRoutes.LOGIN + `?next=${location.href}`); // use replace so user can't go back
    }
  }, [user, router, isLoading]);

  if (isLoading) {
    return loadingComp;
  }

  if (!user) {
    return loadingComp;
  }

  return children;
}
