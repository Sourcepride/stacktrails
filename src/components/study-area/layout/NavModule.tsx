"use client";

import { Checkbox } from "@mui/material";
import { MdDescription } from "@react-icons/all-files/md/MdDescription";
import { MdKeyboardVoice } from "@react-icons/all-files/md/MdKeyboardVoice";
import { MdLink } from "@react-icons/all-files/md/MdLink";
import { MdOndemandVideo } from "@react-icons/all-files/md/MdOndemandVideo";
import { MdQuiz } from "@react-icons/all-files/md/MdQuiz";
import { useTranslations } from "next-intl";

type NavModuleProps = {
  data: FullModule;
  selected?: boolean;
  onClick: () => void;
  completed?: boolean;
  toggleCompleted: toggleCompletedType;
};
const contentTypeIcons = {
  video: (
    <MdOndemandVideo className="inline-block w-5 h-5 mr-2 text-gray-400" />
  ),
  document: (
    <MdDescription className="inline-block w-5 h-5 mr-2 text-gray-400" />
  ),
  quiz: <MdQuiz className="inline-block w-5 h-5 mr-2 text-gray-400" />,
  discussion: (
    <MdKeyboardVoice className="inline-block w-5 h-5 mr-2 text-gray-400" />
  ),
  external_link: <MdLink className="inline-block w-5 h-5 mr-2 text-gray-400" />,
};
const NavModule: React.FC<NavModuleProps> = ({
  data,
  selected,
  completed,
  onClick,
  toggleCompleted,
}) => {
  const t = useTranslations();

  return (
    <div
      className={`text-sm py-4 px-6 border-b border-gray-300 rounded-md ${
        selected && "bg-base"
      } hover:!bg-base`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-8">
        <h3 className="font-light">
          {contentTypeIcons[data.module_type as keyof typeof contentTypeIcons]}
          <span className="ml-1">{data.title}</span>
        </h3>

        <div className="">
          <Checkbox
            checked={!!completed}
            onChange={(e, checked) => {
              e.stopPropagation();
              toggleCompleted({ module_id: data.id, status: checked });
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
          />
        </div>
      </div>
      {data.attachments.length > 0 && (
        <div className="">
          <h6 className="text-sm mb-1">{t("MODULE_ATTACHMENTS")}</h6>
          <div
            className="flex rounded bg-white border border-gray-500 p-2"
            onClick={(e) => e.stopPropagation()}
          >
            {data.attachments.map((v, index) => (
              <a
                key={v.id}
                title={`${t("ATTACHMENT")}${index + 1}`}
                href={v.file_url}
                target="_blank"
                referrerPolicy="strict-origin-when-cross-origin"
              >
                {
                  contentTypeIcons[
                    v.attachment_type as keyof typeof contentTypeIcons
                  ]
                }
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NavModule;
