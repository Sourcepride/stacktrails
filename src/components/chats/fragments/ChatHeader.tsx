"use client";

import { Avatar } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { FaAngleLeft } from "@react-icons/all-files/fa/FaAngleLeft";
import { FaAngleRight } from "@react-icons/all-files/fa/FaAngleRight";
import { FaCalendarAlt } from "@react-icons/all-files/fa/FaCalendarAlt";
import { IoSearch } from "@react-icons/all-files/io5/IoSearch";
import { useEffect, useRef, useState } from "react";

type ChatHeaderProps = {
  data: ChatRead;
  members: ChatMemberRead[];
  onBack?: () => void;
  onSearch?: (query: string) => void;
  onDateFilter?: (date: Date | null) => void;
};

export default function ChatHeader({
  data,
  members,
  onBack,
  onSearch,
  onDateFilter,
}: ChatHeaderProps) {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [searchOccurrenceIndex, setSearchOccurrenceIndex] = useState(0);
  const [totalOccurrences, setTotalOccurrences] = useState(0);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Track parent container width using ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const showBackButton = containerWidth < 700;

  // Get chat name: group name or user's username
  const chatName =
    data.name ||
    data.account?.username ||
    data.account?.profile?.display_name ||
    "Unknown";

  // Get avatar: chat avatar_url or user's profile avatar
  const avatarUrl = data.avatar_url || data.account?.profile?.avatar;

  // Get initials for avatar fallback
  const getInitials = (name: string): string => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(chatName);

  // Get member names (comma-separated)
  const memberNames = members
    .slice(0, 5) // Limit to first 5 members
    .map(
      (member) =>
        member.account?.profile?.display_name ||
        member.account?.username ||
        "Unknown"
    )
    .join(", ");

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setSearchQuery("");
      setSearchOccurrenceIndex(0);
      setTotalOccurrences(0);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    // Simulate finding occurrences (in real app, this would come from search results)
    if (query) {
      setTotalOccurrences(Math.floor(Math.random() * 10) + 1);
      setSearchOccurrenceIndex(1);
    } else {
      setTotalOccurrences(0);
      setSearchOccurrenceIndex(0);
    }
    onSearch?.(query);
  };

  const handleDateClick = () => {
    dateInputRef.current?.showPicker();
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : null;
    setSelectedDate(date);
    onDateFilter?.(date);
  };

  const handleNavigateOccurrence = (direction: "prev" | "next") => {
    if (totalOccurrences === 0) return;

    if (direction === "prev") {
      setSearchOccurrenceIndex((prev) =>
        prev > 1 ? prev - 1 : totalOccurrences
      );
    } else {
      setSearchOccurrenceIndex((prev) =>
        prev < totalOccurrences ? prev + 1 : 1
      );
    }
  };

  return (
    <div
      ref={containerRef}
      className="border-b h-[73px] border-gray-300  bg-white sticky top-0 z-10"
    >
      {/* Main Header */}
      <div className="flex items-center gap-2 px-4 py-3 relative">
        {/* Back Button - Only visible when width < 700px */}
        {showBackButton && (
          <button
            onClick={onBack}
            className="flex-shrink-0 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Go back"
          >
            <FaAngleLeft className="w-5 h-5" />
          </button>
        )}

        {/* Avatar */}
        <div className="flex-shrink-0">
          <Avatar
            src={avatarUrl || undefined}
            alt={chatName}
            sx={{
              width: 48,
              height: 48,
              borderRadius: "100%",
              bgcolor: theme.palette.primary.main,
              fontSize: "1rem",
              fontWeight: 600,
            }}
          >
            {initials}
          </Avatar>
        </div>

        {/* Chat Info */}
        <div className="flex-1 min-w-0">
          <h5 className="font-semibold text-gray-900 truncate mb-0">
            {chatName}
          </h5>
          {members.length > 0 && (
            <p className="text-sm text-gray-600 truncate max-w-[75%]">
              {memberNames}
              {members.length > 5 && ` +${members.length - 5} more`}
            </p>
          )}
        </div>

        {/* Search Icon */}
        <div className="flex-shrink-0 ml-auto">
          <button
            onClick={handleSearchToggle}
            className={`p-2 rounded-lg transition-colors ${
              isSearchOpen
                ? "bg-primary text-white"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
            aria-label="Search messages"
          >
            <IoSearch className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search Bar - Absolute positioned */}
      {isSearchOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-md z-20">
          <div className="flex items-center gap-2 px-4 py-3">
            {/* Date Picker Icon */}
            <button
              onClick={handleDateClick}
              className="flex-shrink-0 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Filter by date"
            >
              <FaCalendarAlt className="w-5 h-5" />
            </button>
            <input
              ref={dateInputRef}
              type="date"
              className="hidden"
              onChange={handleDateChange}
              value={
                selectedDate ? selectedDate.toISOString().split("T")[0] : ""
              }
            />

            {/* Search Input */}
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />

            {/* Navigation Arrows */}
            {searchQuery && totalOccurrences > 0 && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className="text-sm text-gray-600 whitespace-nowrap">
                  {searchOccurrenceIndex} / {totalOccurrences}
                </span>
                <button
                  onClick={() => handleNavigateOccurrence("prev")}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Previous occurrence"
                >
                  <FaAngleLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleNavigateOccurrence("next")}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Next occurrence"
                >
                  <FaAngleRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
