import createMiddleware from "next-intl/middleware";
import { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

export default function middleware(req: NextRequest) {
  const handleRouting = createMiddleware(routing);
  const response = handleRouting(req);
  return response;
}

export const config = {
  matcher: [
    "/((?!(?:api|_next|static)(?:/|$)|favicon\\.ico$|robots\\.txt$|sitemap\\.xml$|.*\\.(?:js|mjs|css|map|json|txt|xml|png|jpg|jpeg|lottie|gif|svg|ico|webp|avif|mp3|mp4|wasm|webmanifest|woff2|woff|ttf|eot)$).*)",
  ],
};
