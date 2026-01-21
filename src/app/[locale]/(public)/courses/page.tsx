"use client";

import CourseCard from "@/common/cards/CourseCard";
import CenterOnLgScreen from "@/common/utils/CenterOnLgScreen";
import LoadingComponent from "@/common/utils/LoadingComponent";
import appAxios from "@/lib/axiosClient";
import { cacheKeys } from "@/lib/cacheKeys";
import { BackendRoutes, PublicRoutes } from "@/routes";
import { Button, Chip, MenuItem, Select } from "@mui/material";
import { IoSearch } from "@react-icons/all-files/io5/IoSearch";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function Page() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract query params
  const q = searchParams.get("q") || "";
  const sort = searchParams.get("sort") || "";
  const level = searchParams.get("level") || "";
  const language = searchParams.get("language") || "";
  const tagsParam = searchParams.get("tags") || ""; // comma-separated
  const selectedTags = tagsParam ? tagsParam.split(",") : [];

  const [searchTerm, setSearchTerm] = useState(q);

  // Fetch all tags (for filter options)
  const { data: allTags } = useQuery({
    queryKey: [cacheKeys.TAGS],
    queryFn: async () => {
      const res = await appAxios.get<Tag[]>(BackendRoutes.TAGS);
      return res.data;
    },
  });

  // React Query setup for courses
  const {
    data,
    isLoading,
    status,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: [
      cacheKeys.EXPLORE,
      { q, sort, level, language, tags: selectedTags },
    ],
    queryFn: async ({ pageParam = 1 }): Promise<Paginated<Course>> => {
      const res = await appAxios.get<Paginated<Course>>(BackendRoutes.EXPLORE, {
        params: {
          q: q || undefined,
          sort: sort || undefined,
          level: level || undefined,
          language: language || undefined,
          tags: selectedTags.length > 0 ? selectedTags.join(",") : undefined,
          page: pageParam,
        },
      });
      return res.data;
    },
    getNextPageParam: (lastPage) =>
      lastPage.has_next ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });

  // update URL params helper
  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${PublicRoutes.COURSES}?${params.toString()}`, {
      scroll: false,
    });
  };

  // toggle tags (add/remove from query)
  const toggleTag = (tagName: string) => {
    const params = new URLSearchParams(searchParams);
    const existing = params.get("tags")?.split(",").filter(Boolean) || [];
    let updated: string[];

    if (existing.includes(tagName)) {
      updated = existing.filter((t) => t !== tagName);
    } else {
      updated = [...existing, tagName];
    }

    if (updated.length > 0) params.set("tags", updated.join(","));
    else params.delete("tags");

    router.push(`/courses?${params.toString()}`, { scroll: false });
  };

  // Search handler
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams("q", searchTerm.trim());
  };

  const hasData = data?.pages?.[0]?.items?.length ?? 0 > 0;

  return (
    <CenterOnLgScreen element="main" className="pb-10 space-y-6 !min-h-[600px]">
      {/* 🔍 Search and Filters Section */}
      <section className="flex flex-col gap-4">
        {/* Search bar */}
        <div className="flex items-center justify-center">
          <form
            onSubmit={handleSearch}
            className="relative w-full md:max-w-md flex-shrink-0"
          >
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-2xl p-4 h-full w-full bg-gray-200 focus:outline-secondary pr-12"
              placeholder={t("SEARCH")}
            />
            <button
              type="submit"
              className="absolute cursor-pointer bg-primary p-2 rounded-xl top-1/2 -translate-y-1/2 right-2"
            >
              <IoSearch size={"20px"} color="white" />
            </button>
          </form>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center justify-between md:justify-start">
          {/* Sort */}
          <Select
            size="small"
            displayEmpty
            value={sort}
            onChange={(e) => updateParams("sort", e.target.value)}
          >
            <MenuItem value="">{t("HOME_SORT.RECENTLY_ADDED")}</MenuItem>
            <MenuItem value="most_enrolled">
              {t("HOME_SORT.MOST_VIEWED")}
            </MenuItem>
            <MenuItem value="top_rated">{t("HOME_SORT.TOP_RATED")}</MenuItem>
          </Select>

          {/* Difficulty */}
          <Select
            size="small"
            displayEmpty
            value={level}
            className="md:ml-auto"
            onChange={(e) => updateParams("level", e.target.value)}
          >
            <MenuItem value="">{t("DIFFICULTY_LEVEL.ALL")}</MenuItem>
            <MenuItem value="beginner">
              {t("DIFFICULTY_LEVEL.BEGINNER")}
            </MenuItem>
            <MenuItem value="intermediate">
              {t("DIFFICULTY_LEVEL.INTERMEDIATE")}
            </MenuItem>
            <MenuItem value="advanced">
              {t("DIFFICULTY_LEVEL.ADVANCED")}
            </MenuItem>
          </Select>

          {/* Language */}
          <Select
            size="small"
            displayEmpty
            value={language}
            onChange={(e) => updateParams("language", e.target.value)}
          >
            <MenuItem value="">{t("LANGUAGE_SELECT.ALL")}</MenuItem>
            <MenuItem value="en">{t("LANGUAGE_SELECT.ENGLISH")}</MenuItem>
            <MenuItem value="de">{t("LANGUAGE_SELECT.GERMAN")}</MenuItem>
            <MenuItem value="fr">{t("LANGUAGE_SELECT.FRENCH")}</MenuItem>
            <MenuItem value="es">{t("LANGUAGE_SELECT.SPANISH")}</MenuItem>
          </Select>
        </div>

        {/* 🏷️ Tags */}
        {allTags && (
          <div className="flex flex-wrap justify-center gap-2 pt-1">
            {allTags.slice(0, 10).map((tag) => {
              const isSelected = selectedTags.includes(tag.name);
              return (
                <Chip
                  key={tag.id}
                  label={tag.name}
                  color={isSelected ? "primary" : "default"}
                  onClick={() => toggleTag(tag.name)}
                  variant={isSelected ? "filled" : "outlined"}
                  sx={{ cursor: "pointer" }}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* 📚 Course List */}
      <LoadingComponent
        loading={isLoading}
        data={data}
        empty={!hasData}
        error={status === "error"}
      >
        {(validData) => (
          <section className="space-y-6">
            {validData.pages.map((page, i) => (
              <div
                key={`page__${i}`}
                className="grid gap-6 w-full [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]"
              >
                {page.items.map((course: Course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ))}

            {hasNextPage && (
              <div className="flex justify-center pt-6">
                <Button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  variant="outlined"
                >
                  {isFetchingNextPage
                    ? `${t("LOADING.LOADING")}...`
                    : t("LOADING.LOAD_MORE")}
                </Button>
              </div>
            )}
          </section>
        )}
      </LoadingComponent>
    </CenterOnLgScreen>
  );
}
