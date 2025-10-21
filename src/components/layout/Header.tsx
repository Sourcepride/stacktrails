import { Link } from "@/i18n/navigation";
import { AppRoutes, PublicRoutes } from "@/routes";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import GoogleOneTapWrapper from "../auth/GoogleOneTapWrapper";
import CTAORProfie from "./CTAoRProfile";
import LanguageSelector from "./LanguageSelector";

type params = {};

const PublicHeader: React.FC<params> = async () => {
  const t = await getTranslations("PUBLIC_HEADER");

  return (
    <>
      <header className="flex items-center h-[90px] py-4 px-4 md:px-8 xl:px-16">
        <Link href={PublicRoutes.HOME} className="flex items-baseline">
          <Image src="/black-logo.svg" alt="Logo" width={50} height={50} />
          <h1 className="hidden font-bold text-2xl -translate-1 md:block">
            tackTrails
          </h1>
        </Link>

        <nav className="hidden mx-16 lg:block">
          <ul className="flex space-x-8">
            {[
              { href: PublicRoutes.ABOUT, label: t("ABOUT") },
              { href: PublicRoutes.COURSES, label: t("EXPLORE") },
              { href: PublicRoutes.PAID_COURSES, label: t("PAID_COURSES") },
              { href: AppRoutes.CREATE_COURSE, label: t("CREATE") },
            ].map((item, idx) => (
              <li key={idx} className="relative">
                <a
                  href={item.href}
                  className="relative group hover:text-accent transition-colors duration-200 pb-1"
                >
                  {item.label}
                  <span
                    className="pointer-events-none absolute left-0 bottom-0 w-full h-[2px] bg-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                    aria-hidden="true"
                  />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <GoogleOneTapWrapper />
          <LanguageSelector />
          <CTAORProfie />
        </div>
      </header>
    </>
  );
};

export default PublicHeader;
