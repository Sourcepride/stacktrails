"use client";

import messageToast from "@/common/popups/MessageCustomToast";
import { useRouter } from "@/i18n/navigation";
import { IoMdWarning } from "@react-icons/all-files/io/IoMdWarning";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { PropsWithChildren, useEffect, useMemo } from "react";

type QueryMessagesWrapperProps = PropsWithChildren;
const QueryMessagesWrapper: React.FC<QueryMessagesWrapperProps> = ({
  children,
}) => {
  const t = useTranslations("BACKEND_MESSAGES");
  const searchParams = useSearchParams();
  const messageParam = searchParams.get("message");
  const router = useRouter();

  const messages = useMemo(
    () => ({
      account_exists: {
        value: t("ACCOUNT_EXISTS"),
        title: (
          <div className="flex items-center gap-2">
            {t("SIGN_IN_ERROR")}
            <IoMdWarning color="#FF9410" width={30} height={30} />
          </div>
        ),
      },
    }),
    [t]
  );

  useEffect(() => {
    let timerId: any;

    if (messageParam && messages[messageParam as keyof typeof messages]) {
      const message = messages[messageParam as keyof typeof messages];
      timerId = setTimeout(() => {
        messageToast({
          title: message.title,
          description: message.value,
          onClose() {
            const params = new URLSearchParams(searchParams.toString());
            params.delete("message");
            const url =
              window.location.pathname.substring(3) +
              (params.toString() ? `?${params}` : "");

            router.push(url || "/");
          },
        });
      });
    }

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [messageParam, messages, router, searchParams]);
  return <>{children}</>;
};

export default QueryMessagesWrapper;
