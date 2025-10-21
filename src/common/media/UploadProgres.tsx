"use client";

import { useUploads } from "@/hooks/useUploads"; // adjust import path
import { Tooltip } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import { IoClose } from "@react-icons/all-files/io5/IoClose";
import { MdExpandLess } from "@react-icons/all-files/md/MdExpandLess";
import { MdExpandMore } from "@react-icons/all-files/md/MdExpandMore";
import { useTranslations } from "next-intl";
import React, { useState } from "react";

const UploadProgress: React.FC = () => {
  const t = useTranslations();
  const { jobs } = useUploads(); // now we get jobs directly from zustand
  const [expanded, setExpanded] = useState(false);

  if (jobs.length === 0) return null;

  const visibleJobs = expanded ? jobs : jobs.slice(0, 2);

  return (
    <div className="fixed bottom-8 right-8 w-96 bg-white shadow-lg rounded-2xl border border-gray-200 overflow-hidden z-50">
      <div className="p-3 space-y-3">
        {visibleJobs.map((job) => (
          <div
            key={job.id}
            className="flex items-center gap-3 border-b last:border-none pb-2"
          >
            {/* Percentage on the left */}
            <div className="text-sm font-medium text-gray-700 w-12 shrink-0 text-right border-primary border-2 rounded-full flex  items-center justify-center h-12">
              {job.progress}%
            </div>

            {/* File info + progress bar */}
            <div className="flex-1">
              <div className="text-sm text-gray-800  mb-1 flex  items-center gap-2 ">
                <div className="grow truncate">
                  {(job.name || job.id).length > 20
                    ? (job.name || job.id).substring(0, 20) + "..."
                    : job.name || job.id}
                </div>

                <Tooltip title={t("UPLOAD.CANCEL_UPLOAD")}>
                  <button
                    type="button"
                    className="p-1 rounded-full cursor-pointer  bg-red-400"
                    onClick={job.cancel}
                  >
                    <IoClose className="w-6 h-6" />
                  </button>
                </Tooltip>
              </div>
              <LinearProgress
                variant="determinate"
                value={job.progress}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 3,
                  },
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {jobs.length > 2 && (
        <div className="flex justify-center bg-gray-50">
          <IconButton
            size="small"
            onClick={() => setExpanded((prev) => !prev)}
            aria-label="toggle expand"
          >
            {expanded ? <MdExpandLess /> : <MdExpandMore />}
          </IconButton>
        </div>
      )}
    </div>
  );
};

export default UploadProgress;
