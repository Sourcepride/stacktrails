import CenterOnLgScreen from "@/common/utils/CenterOnLgScreen";
import { Link } from "@/i18n/navigation";
import { PublicRoutes } from "@/routes";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";
import { SiTiktok } from "react-icons/si";

type params = {};

export default async function PublicFooter(_params: params) {
  const t = await getTranslations("PUBLIC_FOOTER");
  const year = new Date().getFullYear();

  return (
    <footer className="bg-base">
      <CenterOnLgScreen className="py-8 ">
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 ">
          {/* Layer 1: logo + navs */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <div className="flex items-center gap-4">
              <Image
                src="/black-logo.svg"
                alt="StackTrails"
                width={48}
                height={48}
              />
              <span className="font-semibold text-lg">StackTrails</span>
            </div>

            <nav aria-label="Footer primary navigation">
              <ul className="flex flex-wrap gap-6 text-sm">
                <li>
                  <Link href={PublicRoutes.ABOUT} className="hover:underline">
                    {t("ABOUT")}
                  </Link>
                </li>
                <li>
                  <Link href={PublicRoutes.BLOG} className="hover:underline">
                    {t("BLOG")}
                  </Link>
                </li>
                <li>
                  <Link href={PublicRoutes.CONTACT} className="hover:underline">
                    {t("CONTACT")}
                  </Link>
                </li>
                <li>
                  <Link href={PublicRoutes.SUPPORT} className="hover:underline">
                    {t("SUPPORT")}
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Layer 2: social icons */}
          <div className="flex justify-center gap-4">
            <a
              href="https://web.facebook.com/stacktrails"
              aria-label="Facebook"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-[var(--color-primary)] hover:text-white transition-colors"
            >
              <FaFacebookF />
            </a>
            <a
              href="https://www.instagram.com/stack_trails"
              aria-label="Instagram"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-[var(--color-primary)] hover:text-white transition-colors"
            >
              <FaInstagram />
            </a>
            <a
              href="https://www.youtube.com/@stacktrails"
              aria-label="YouTube"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-[var(--color-primary)] hover:text-white transition-colors"
            >
              <FaYoutube />
            </a>
            <a
              href="https://www.tiktok.com/@stacktrails"
              aria-label="TikTok"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-[var(--color-primary)] hover:text-white transition-colors"
            >
              <SiTiktok />
            </a>
            <a
              href="https://x.com/stacktrails"
              aria-label="X"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-[var(--color-primary)] hover:text-white transition-colors"
            >
              <FaTwitter />
            </a>
          </div>

          {/* Layer 3: copyright + utility nav */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-700/90">
              © {year} Stack Trails — {t("RIGHTS")}
            </div>

            <nav aria-label="Footer legal">
              <ul className="flex gap-4 text-sm">
                <li>
                  <Link
                    href={PublicRoutes.POLICY}
                    className="text-gray-700 hover:text-[var(--color-primary)]"
                  >
                    {t("PRIVACY")}
                  </Link>
                </li>
                <li>
                  <Link
                    href={PublicRoutes.TERMS}
                    className="text-gray-700 hover:text-[var(--color-primary)]"
                  >
                    {t("Terms")}
                  </Link>
                </li>
                <li>
                  <Link
                    href={PublicRoutes.FAQs}
                    className="text-gray-700 hover:text-[var(--color-primary)]"
                  >
                    {t("FAQs")}
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </CenterOnLgScreen>
    </footer>
  );
}
