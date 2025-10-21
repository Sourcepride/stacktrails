"use client";

import { PublicRoutes } from "@/routes";
import { IoSearch } from "@react-icons/all-files/io5/IoSearch";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useRef } from "react";

type HeroSearchProps = {};
const HeroSearch: React.FC<HeroSearchProps> = ({}) => {
  const t = useTranslations("HERO");
  const searchRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  return (
    <div className="relative">
      <input
        type="text"
        className="rounded-2xl p-4 h-full  w-full bg-gray-200 focus:outline-secondary"
        placeholder={t("SEARCH")}
        ref={searchRef}
      />
      <button
        type="button"
        onClick={() => {
          if (searchRef.current?.value) {
            router.push(`${PublicRoutes.COURSES}?q=${searchRef.current.value}`);
          }
        }}
        className="absolute cursor-pointer bg-primary p-2 rounded-xl  top-1/2 -translate-y-1/2 right-2"
      >
        <IoSearch size={"20px"} color="white" />
      </button>
    </div>
  );
};

export default HeroSearch;
