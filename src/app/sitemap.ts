import { BackendRoutes } from "@/routes";
import { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://stacktrails.com";
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

type Paginated<T> = {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
  items: T[];
};

type Course = {
  slug: string;
  updated_at?: string;
};

export const revalidate = 3600; // Revalidate sitemap every hour
const MAX_PAGES = 50;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const allCourses: Course[] = [];

  // --- PAGINATED FETCH LOOP ---
  try {
    let page = 1;
    let hasNext = true;

    while (hasNext && page <= MAX_PAGES) {
      const res = await fetch(
        `${apiUrl}${BackendRoutes.ALL_COURSES}?page=${page}`,
        { next: { revalidate: 3600 } } // Cache each page for 1 hour
      );

      if (!res.ok) break;

      const data: Paginated<Course> = await res.json();

      allCourses.push(...(data.items || []));
      hasNext = data.has_next;
      page += 1;
    }
  } catch (error) {
    console.error("⚠️ Error fetching paginated courses for sitemap:", error);
  }

  // --- STATIC ROUTES ---
  const staticRoutes = [
    "",
    "about",
    "contact",
    "courses",
    "paid-courses",
    "blog",
    "site/privacy-policy",
    "site/terms-and-conditions",
    "site/faqs",
    "site/support",
  ].map((path) => ({
    url: `${siteUrl}/${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as any,
    priority: 0.8,
  }));

  // --- COURSE DETAIL ROUTES ---
  const courseRoutes = allCourses.map((course) => ({
    url: `${siteUrl}/course/${course.slug}`,
    lastModified: course.updated_at ? new Date(course.updated_at) : new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  return [...staticRoutes, ...courseRoutes];
}
