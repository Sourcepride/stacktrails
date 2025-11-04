import { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://stacktrails.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/about",
          "/contact",
          "/courses",
          "/course/", // ✅ allow course detail routes
          "/blog",
          "/paid-courses",
          "/site/",
        ],
        disallow: ["/auth/", "/dashboard/", "/api/", "/private/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
