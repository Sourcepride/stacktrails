"use client";

import { Link } from "@/i18n/navigation";
import { appToast } from "@/lib/appToast";
import { PublicRoutes } from "@/routes";
import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  CircularProgress,
  Divider,
  Typography,
} from "@mui/material";
import { FaRegShareSquare } from "@react-icons/all-files/fa/FaRegShareSquare";
import { FaFireFlameCurved } from "@react-icons/all-files/fa6/FaFireFlameCurved";
import { useTranslations } from "next-intl";
import Image from "next/image";

function getBgColor() {
  return ["primary", "secondary", "accentColor"][Math.floor(Math.random() * 3)];
}

type StudyHeaderProps = {
  course: FullCourse;
  progress: CourseProgress;
  enrollment: CourseEnrollment;
};
const StudyHeader: React.FC<StudyHeaderProps> = ({
  course,
  enrollment,
  progress,
}) => {
  const t = useTranslations();

  const handleShareClick = async () => {
    const url =
      typeof window !== "undefined"
        ? new URL(window.location.href).origin +
          PublicRoutes.getCourseRoute(course.slug)
        : "";
    const shareData = {
      title: course.title,
      text: `${t("STUDY_WITH_ME")}: ${course.title}`,
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData as ShareData);
        appToast.Success("Link shared");
        return;
      } catch (err) {
        // Fall through to clipboard copy on cancel/error
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      appToast.Success("Link copied to clipboard");
    } catch (err) {
      appToast.Error("Unable to copy link");
    }
  };
  return (
    <header
      className={`bg-[#04111F] gap-4 text-[#fffdfd] flex flex-wrap items-center px-4 md:px-8 lg:h-[58px]`}
    >
      <Link href={"/"} className="flex items-baseline">
        <Image
          src="/white-logo.svg"
          alt="Logo"
          width={40}
          height={40}
          className="translate-y-1"
        />
        <h2 className="font-bold -translate-x-2 hidden md:block">tacktrails</h2>
      </Link>
      <Divider
        orientation="vertical"
        sx={{ height: "70%", background: "white" }}
        className="hidden lg:!block"
      />
      <div className="line-clamp-2">{course.title}</div>
      <div className="flex items-center gap-4 w-full justify-between lg:!w-auto lg:ml-auto  lg:!justify-start">
        <div className="hidden">
          <ProfileListOfStudyGroup />
        </div>

        <CircularProgressWithLabel value={enrollment.progress_percentage} />

        <div className="flex items-center">
          <FaFireFlameCurved color="#FFB300" size={20} />
          <p className="font-bold">{progress?.current_streak ?? 0}</p>
        </div>
        <div
          role="button"
          title="Share this page"
          aria-label="Share this page"
          onClick={handleShareClick}
          className="cursor-pointer"
        >
          <FaRegShareSquare size={18} />
        </div>
        <Button title="create study group" className="!capitalize" size="small">
          Create Group
        </Button>
      </div>
    </header>
  );
};

export default StudyHeader;

function ProfileListOfStudyGroup() {
  return (
    <div>
      <AvatarGroup
        max={5}
        sx={{
          "& .MuiAvatar-root": { width: 28, height: 28, fontSize: 14 },
          "& .MuiAvatar-root:not(:first-of-type)": { ml: "-9.6px" },
        }}
      >
        <Avatar
          alt="Alice"
          src="/placeholder.png"
          sx={{
            bgcolor: (theme) =>
              (
                theme.palette?.[
                  getBgColor() as keyof typeof theme.palette
                ] as any
              ).main,
          }}
        />
        <Avatar
          alt="Bob"
          sx={{
            bgcolor: (theme) =>
              (
                theme.palette?.[
                  getBgColor() as keyof typeof theme.palette
                ] as any
              ).main,
          }}
        >
          B
        </Avatar>
        <Avatar
          alt="Carmen"
          src="/default_dp.svg"
          sx={{
            bgcolor: (theme) =>
              (
                theme.palette?.[
                  getBgColor() as keyof typeof theme.palette
                ] as any
              ).main,
          }}
        />
        <Avatar
          alt="Diego"
          sx={{
            bgcolor: (theme) =>
              (
                theme.palette?.[
                  getBgColor() as keyof typeof theme.palette
                ] as any
              ).main,
          }}
        >
          D
        </Avatar>
        <Avatar
          alt="Eve"
          src="/placeholder.png"
          sx={{
            bgcolor: (theme) =>
              (
                theme.palette?.[
                  getBgColor() as keyof typeof theme.palette
                ] as any
              ).main,
          }}
        />
        <Avatar
          alt="Frank"
          sx={{
            bgcolor: (theme) =>
              (
                theme.palette?.[
                  getBgColor() as keyof typeof theme.palette
                ] as any
              ).main,
          }}
        >
          F
        </Avatar>
      </AvatarGroup>
    </div>
  );
}

function CircularProgressWithLabel({ value }: { value: number }) {
  const roundedValue = Math.round(value);

  return (
    <Box
      sx={{
        position: "relative",
        display: "inline-flex",
        width: 42,
        height: 42,
      }}
    >
      <CircularProgress
        variant="determinate"
        value={roundedValue}
        size={42}
        thickness={4}
        sx={{
          color: (theme) => theme.palette.secondary.main,
        }}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: "absolute",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="caption"
          component="div"
          color="white"
          sx={{ fontWeight: "bold", fontSize: "0.7rem" }}
        >
          {`${roundedValue}%`}
        </Typography>
      </Box>
    </Box>
  );
}
