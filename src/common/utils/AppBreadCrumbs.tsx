import useHideOnClickedOutside from "@/hooks/useHideOnClickedOutside";
import { Link } from "@/i18n/navigation";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import { BsThreeDots } from "@react-icons/all-files/bs/BsThreeDots";
import { LiaAngleRightSolid } from "@react-icons/all-files/lia/LiaAngleRightSolid";
import * as React from "react";

type props = {
  links: { to: string; name: string }[];
  options?: boolean;
  showBorder?: boolean;
} & React.PropsWithChildren;

export default function AppLinkBreadCrumbs({
  links,
  children,
  options,
  showBorder = false,
}: props) {
  const [opened, setOpened] = React.useState(false);
  const ref = useHideOnClickedOutside(setOpened.bind(undefined, false));

  const breadcrumbs = links.map(({ name, to }, index, array) => (
    <Link
      href={to}
      key={to}
      className={`text-sm font-medium capitalize text-primary ${
        index + 1 === array.length ? "!text-[#A9A9A9]" : ""
      }`}
    >
      {name}
    </Link>
  ));

  return (
    <div
      className={`flex w-full items-center justify-between py-6  px-4 lg:px-6 xlc:px-8 ${
        showBorder && "border-b"
      }`}
    >
      <Breadcrumbs
        separator={<LiaAngleRightSolid strokeWidth="2" stroke="#A9A9A9" />}
        aria-label="breadcrumb"
      >
        {breadcrumbs}
      </Breadcrumbs>
      {options && (
        <div ref={ref} className="relative">
          <button
            onClick={setOpened.bind(undefined, !opened)}
            className="flex items-center gap-1 [appearance:none]"
          >
            <span className="text-sm capitalize">options</span>
            <span>
              <BsThreeDots />
            </span>
          </button>
          <div
            className={`invisible absolute right-0 top-[calc(100%+20px)] transition-all ${
              opened && "!visible !top-[calc(100%+15px)]"
            }`}
          >
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
