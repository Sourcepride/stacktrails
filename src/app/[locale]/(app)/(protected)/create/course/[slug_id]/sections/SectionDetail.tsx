"use client";

import AppDrawer from "@/common/drawer/AppDrawer";
import AppDrawerRow from "@/common/drawer/AppDrawerRow";
import AppDrawerSectionHeader from "@/common/drawer/AppDrawerSectionHeader";
import { Link } from "@/i18n/navigation";
import { AppRoutes } from "@/routes";
import { Button } from "@mui/material";
import { useTranslations } from "next-intl";

type SectionDetailProps = { data: Section; onClose: () => void };
const SectionDetail: React.FC<SectionDetailProps> = ({ data, onClose }) => {
  const t = useTranslations();
  return (
    <AppDrawer isOpen={true} close={onClose} topBorder>
      <AppDrawerSectionHeader>Details</AppDrawerSectionHeader>

      <div className="px-4 lg:px-6">
        <AppDrawerRow header={t("SECTIONS.TITLE")} jsx={data.title} />
        <AppDrawerRow
          header={t("SECTIONS.DESCRIPTION")}
          jsx={data.description}
        />
        <AppDrawerRow header={t("SECTIONS.ORDER")} jsx={data.order_index} />
        <AppDrawerRow
          header={t("SECTIONS.ESTIMATE_DURATION")}
          jsx={data.estimated_duration_minutes}
        />
        <AppDrawerRow
          header={t("SECTIONS.PROGRESSION_TYPE")}
          jsx={data.progression_type}
        />
      </div>

      <AppDrawerSectionHeader>
        {t("SECTIONS.OBJECTIVES")}
      </AppDrawerSectionHeader>
      <div className="px-4 lg:px-6">
        {data.learning_objectives?.map((objective, index) => (
          <div key={"objective" + index} className="flex items-start gap-3">
            <span className="text-sm leading-relaxed">{objective}</span>
          </div>
        ))}
      </div>

      <AppDrawerSectionHeader>
        {t("SECTIONS.COMPLETION_CRITERIA")}
      </AppDrawerSectionHeader>
      <div className="px-4 lg:px-6">
        {data.completion_criteria?.map((objective, index) => (
          <div key={"objective" + index} className="flex items-start gap-3">
            <span className="text-sm leading-relaxed">{objective}</span>
          </div>
        ))}
      </div>
      <div className="px-4 lg:px-6">
        <Link href={AppRoutes.EDIT_SECTION(data.id)}>
          <Button fullWidth disableElevation sx={{}}>
            {t("SECTIONS.EDIT")}
          </Button>
        </Link>
      </div>
    </AppDrawer>
  );
};

export default SectionDetail;
