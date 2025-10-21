"use client";

import { useRouter } from "@/i18n/navigation";
import { PublicRoutes } from "@/routes";

export default function HeroTag({ name }: { name: string }) {
  const router = useRouter();
  const clickHandler = () => {
    router.push(`${PublicRoutes.COURSES}?tags=${name}`);
  };
  return (
    <div
      className="cursor-pointer rounded-2xl  p-2 text-xs shadow-border hover:text-white hover:bg-neutral-black hover:shadow-none"
      onClick={clickHandler}
    >
      {name}
    </div>
  );
}
