import CenterOnLgScreen from "@/common/utils/CenterOnLgScreen";
import ComingSoon from "@/common/utils/ComingSoon";
import { getTranslations } from "next-intl/server";

export default async function Page() {
  const t = await getTranslations();
  return (
    <CenterOnLgScreen element={"main"}>
      <ComingSoon message={t("PAID_COURSES")} height={320} width={320} />
    </CenterOnLgScreen>
  );
}
