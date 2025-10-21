"use client";

import Loading from "@/app/[locale]/(public)/loading";
import { useTranslations } from "next-intl";
import { ReactNode } from "react";
import CenterOnLgScreen from "./CenterOnLgScreen";
import Empty from "./Empty";
import ErrorDisplay from "./Error";

type LoadingComponentProps<T> = {
  loading: boolean;
  empty?: boolean;
  error?: boolean;
  data?: T;
  errorStatus?: number;
  loadingComponent?: ReactNode;
  emptyComponent?: ReactNode;
  errorComponent?: ReactNode;
  children?: ((data: T) => ReactNode) | ReactNode;
};

const LoadingComponent = <T,>({
  loading,
  empty = false,
  error = false,
  errorStatus,
  data,
  loadingComponent,
  emptyComponent,
  errorComponent,
  children,
}: LoadingComponentProps<T>) => {
  const t = useTranslations();
  if (error) {
    const errorDisplay =
      errorStatus === 403 ? (
        <ErrorDisplay
          title={t("PERMISSION_REQUIRED")}
          message={t("PERMISSION_MESSAGE")}
        />
      ) : errorStatus === 404 ? (
        <ErrorDisplay title={t("NOT_FOUND")} message={t("NOT_FOUND_TEXT")} />
      ) : (
        <ErrorDisplay />
      );

    return (
      errorComponent ?? <CenterOnLgScreen>{errorDisplay}</CenterOnLgScreen>
    );
  }

  if (loading) {
    return (
      loadingComponent ?? (
        <CenterOnLgScreen>
          <Loading />
        </CenterOnLgScreen>
      )
    );
  }

  if (empty) {
    return (
      emptyComponent ?? (
        <CenterOnLgScreen>
          <Empty />
        </CenterOnLgScreen>
      )
    );
  }

  if (typeof children === "function") {
    // safe cast: children will only be called if data is defined
    return <>{data !== undefined ? children(data) : null}</>;
  }

  return <>{children}</>;
};

export default LoadingComponent;
