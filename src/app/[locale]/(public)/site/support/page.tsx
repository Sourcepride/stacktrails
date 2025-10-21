import CenterOnLgScreen from "@/common/utils/CenterOnLgScreen";
import { MdGroups } from "@react-icons/all-files/md/MdGroups";
import { MdHandshake } from "@react-icons/all-files/md/MdHandshake";
import { MdSupportAgent } from "@react-icons/all-files/md/MdSupportAgent";
import { getTranslations } from "next-intl/server";

export default async function Page() {
  const t = await getTranslations();

  const supportOptions = [
    {
      icon: <MdHandshake className="text-primary text-4xl" />,
      title: t("SUPPORT.LI_1"), // Partnerships
    },
    {
      icon: <MdSupportAgent className="text-primary text-4xl" />,
      title: t("SUPPORT.LI_2"), // Investment or sponsorship
    },
    {
      icon: <MdGroups className="text-primary text-4xl" />,
      title: t("SUPPORT.LI_3"), // Feedback or issues
    },
  ];

  return (
    <CenterOnLgScreen
      element={"main"}
      className="min-h-[600px] space-y-8 !max-w-[120ch]"
    >
      {/* Page Header */}
      <h1 className="text-center text-accent font-bold text-3xl md:text-4xl">
        {t("SUPPORT.SUPPORT_STACKTRAILS")}
      </h1>

      <p className="text-center text-lg text-black">
        {t("SUPPORT.SUPPORT_TEXT")}
      </p>

      <div className="space-y-8">
        {/* Intro Text */}
        <p className="text-center  text-black">{t("SUPPORT.SUPPORT_MAIN")}</p>

        {/* Support Options Grid */}
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {supportOptions.map((option, idx) => (
            <div
              key={idx}
              className="group relative flex flex-col items-center text-center bg-white border border-gray-200 rounded-xl p-8 hover:border-primary hover:shadow-xl transition-all duration-300 ease-out"
            >
              {/* Subtle gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300" />

              <div className="relative z-10 mb-4 transform group-hover:scale-110 transition-transform duration-300">
                {option.icon}
              </div>
              <p className="relative z-10  font-semibold text-black leading-relaxed">
                {option.title}
              </p>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="text-center space-y-3 pt-4">
          <p className="text-lg font-semibold text-black">
            {t("SUPPORT.ALL_EARS")}
          </p>

          <p className="text-base text-black">
            {t("SUPPORT.EMAIL_US")}{" "}
            <a
              href="mailto:support@stacktrails.com"
              className="text-primary font-semibold hover:underline transition-colors"
            >
              support@stacktrails.com
            </a>
          </p>

          <p className="text-base text-black">
            {t("SUPPORT.FUTURE_OF_LEARNING")}
          </p>

          <p className="text-sm text-black/70">{t("SUPPORT.FINAL")}</p>
        </div>
      </div>
    </CenterOnLgScreen>
  );
}
