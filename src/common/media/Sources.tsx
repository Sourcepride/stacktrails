"use client";

import {
  Button,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import { FiChevronDown } from "@react-icons/all-files/fi/FiChevronDown";
import { FiChevronUp } from "@react-icons/all-files/fi/FiChevronUp";
import Image from "next/image";
import React, { useMemo, useState } from "react";
import { AvailableSources } from "./media.constants";

type Option = {
  label: string;
  icon: string;
  value: string;
};

type props = {
  defaultVal: string;
  sources: AvailableSources[];
  callback: (value: string) => void;
};

export default function CustomMenu({ callback, defaultVal, sources }: props) {
  const options: Option[] = useMemo(
    () => [
      { label: "Youtube", icon: "/icons8-youtube.svg", value: "youtube" },
      {
        label: "Google Drive",
        icon: "/icons8-drive.svg",
        value: "google_drive",
      },
      { label: "Dropbox", icon: "/icons8-dropbox.svg", value: "drop_box" },
      {
        label: "Daily motion",
        icon: "/icons8-alight-motion.svg",
        value: "daily_motion",
      },
      {
        label: "link",
        icon: "/icons8-link-24.png",
        value: "link",
      },
    ],
    []
  );

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selected, setSelected] = useState<Option>(
    options.find((x) => x.value === defaultVal) ?? options[0]
  );

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handleSelect = (option: Option) => {
    callback(option.value);
    setSelected(option);
    setAnchorEl(null);
  };

  return (
    <div className="">
      <Button
        variant="outlined"
        onClick={handleClick}
        endIcon={
          <div className="flex flex-col ">
            <FiChevronUp
              style={{ fontSize: "0.9rem", transform: "TranslateY(2px)" }}
            />
            <FiChevronDown
              style={{ fontSize: "0.9rem", transform: "TranslateY(-2px)" }}
            />
          </div>
        }
        sx={{
          textTransform: "none",
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 2,
          py: 1,
          border: "1px solid rgba(0,0,0,0.15)",
          color: "gray",
        }}
      >
        <ListItemIcon sx={{ minWidth: "24px" }}>
          <Image src={selected.icon} alt={"icon"} height={24} width={24} />
        </ListItemIcon>
        <ListItemText primary={selected.label} />
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        {options
          .filter((s) => !!sources.find((v) => v === s.value))
          .map((option) => (
            <MenuItem
              sx={{
                width: "300px",
              }}
              key={option.value}
              onClick={() => handleSelect(option)}
              selected={selected.value === option.value}
            >
              <ListItemIcon sx={{ minWidth: "24px" }}>
                <Image src={option.icon} alt={"icon"} height={24} width={24} />
              </ListItemIcon>
              <ListItemText>{option.label}</ListItemText>
            </MenuItem>
          ))}
      </Menu>
    </div>
  );
}
