import { useAppStore } from "@/store";
import { useTranslations } from "next-intl";

type WelcomeCardProps = {};
const WelcomeCard: React.FC<WelcomeCardProps> = ({}) => {
  const t = useTranslations();
  const { user } = useAppStore((s) => s);
  return (
    <div className="bg-gray-100 w-full rounded-xl py-8 px-4 space-y-1">
      <h1 className="text-2xl font-bold">
        {t("WELCOME_MESSAGE")}{" "}
        {user?.profile.display_name || `@${user?.username}`}
      </h1>
      <div className="text-[#6c757d] text-sm">{t("STUDY_REPORT")}</div>
    </div>
  );
};

export default WelcomeCard;
