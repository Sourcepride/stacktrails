"use client";

import { Link } from "@/i18n/navigation";
import { AppRoutes } from "@/routes";
import { Button } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { FaPlus } from "@react-icons/all-files/fa/FaPlus";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { useFilter } from "./FilterProvider";

type params = {};

export default function HomeFilter(params_: params) {
  const {
    setValue,
    value: { level, sort },
  } = useFilter();

  const t = useTranslations();
  const difficultyLevels = useMemo(
    () => [
      { name: t("DIFFICULTY_LEVEL.BEGINNER"), value: "beginner" },
      { name: t("DIFFICULTY_LEVEL.INTERMEDIATE"), value: "intermediate" },
      { name: t("DIFFICULTY_LEVEL.ADVANCED"), value: "advanced" },
      { name: t("DIFFICULTY_LEVEL.EXPERT"), value: "expert" },
    ],
    [t]
  );
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-6">
      <div className="w-full md:w-auto mb-4 md:mb-0">
        {/* MUI Select for Popular */}
        <Select
          labelId="popular-select-label"
          id="popular-select"
          value={sort}
          fullWidth
          size="small"
          variant="outlined"
          displayEmpty
          onChange={(e) => setValue({ sort: e.target.value })}
        >
          <MenuItem value="most_enrolled">
            {t("HOME_SORT.MOST_VIEWED")}
          </MenuItem>

          <MenuItem value="top_rated">{t("HOME_SORT.TOP_RATED")}</MenuItem>
          <MenuItem value="recent">{t("HOME_SORT.RECENTLY_ADDED")}</MenuItem>
        </Select>
      </div>
      <div className="w-full md:w-auto">
        {/* Desktop: show tags, Mobile: show select dropdown */}
        <div className="hidden lg:flex gap-4">
          <FilterPropertiesTag
            value={null}
            name={t("DIFFICULTY_LEVEL.ALL")}
            selected={!level}
            onClick={(e) => setValue({ level: e as any })}
          />
          {difficultyLevels.map((level_) => (
            <FilterPropertiesTag
              key={level_.value}
              value={level_.value}
              name={level_.name}
              selected={level === level_.value}
              onClick={(e) => setValue({ level: e as any })}
            />
          ))}
        </div>
        <select
          className="lg:hidden w-full p-2 rounded-md border"
          value={level || "default"}
          onChange={(e) =>
            setValue({
              level:
                e.target.value === "default" ? null : (e.target.value as any),
            })
          }
        >
          <option value="default">{t("DIFFICULTY_LEVEL.ALL")}</option>
          {difficultyLevels.map((level) => (
            <option key={level.value} value={level.value}>
              {level.name}
            </option>
          ))}
        </select>
      </div>
      <div className="hidden md:block">
        <Link href={AppRoutes.CREATE_COURSE}>
          <Button variant="contained" endIcon={<FaPlus size={"15px"} />}>
            {t("PUBLIC_MAIN.CREATE_COURSE")}
          </Button>
        </Link>
      </div>
    </div>
  );
}

function FilterPropertiesTag({
  name,
  value,
  selected,
  onClick,
}: {
  name: string;
  value: string | null;
  selected?: boolean;
  onClick: (value: string | null) => void;
}) {
  return (
    <div
      className={`cursor-pointer p-2 px-4 rounded-xl font-semibold text-sm ${
        selected ? "bg-base" : "shadow-border"
      }`}
      onClick={() => onClick(value)}
    >
      {name}
    </div>
  );
}
