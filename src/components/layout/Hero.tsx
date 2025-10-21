import { getTranslations } from "next-intl/server";
import HeroImage from "./HeroImage";
import HeroSearch from "./HeroSearch";
import HeroTag from "./HeroTag";

const tags = [
  "Physics",
  "Electronics",
  "Maths",
  "Computer Science",
  "Aerospace",
];

export default async function Hero() {
  const t = await getTranslations("HERO");

  return (
    <section className="flex  justify-between gap-8 flex-col-reverse md:flex-row">
      <div className="max-w-[68ch] h-fit grid gap-4">
        <div>
          <h1 className="text-2xl  font-bold md:text-5xl">{t("MAIN")}</h1>
          <p className="py-4 font-light">{t("SUB")}</p>
        </div>
        <HeroSearch />
        <div className="flex items-center flex-wrap gap-2">
          <span>{t("TAGS")}: </span>
          <span className="flex items-center gap-2 px-2 flex-wrap">
            {tags.map((val, i) => (
              <HeroTag name={val} key={`tag-${i}`} />
            ))}
          </span>
        </div>
      </div>
      <HeroImage />
      {/* <div className="fixed top-0  right-0 -z-[1]">
        <Image
          src="/contor.svg"
          width={500}
          height={200}
          alt="Wave Haikei"
          className="w-full h-[700px]"
        />
      </div> */}
    </section>
  );
}
