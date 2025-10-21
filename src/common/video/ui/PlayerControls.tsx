"use client";

import { RefObject, useContext } from "react";
import screenfull from "screenfull";
import { ReactPlayerProvider } from "../VidPlayer";

// icons
import { FaPause } from "@react-icons/all-files/fa/FaPause";
import { FaPlay } from "@react-icons/all-files/fa/FaPlay";
import { FaRedo } from "@react-icons/all-files/fa/FaRedo";
import { FaUndo } from "@react-icons/all-files/fa/FaUndo";
import { FaVolumeMute } from "@react-icons/all-files/fa/FaVolumeMute";
import { FaVolumeUp } from "@react-icons/all-files/fa/FaVolumeUp";
import { MdFullscreen } from "@react-icons/all-files/md/MdFullscreen";
import { MdFullscreenExit } from "@react-icons/all-files/md/MdFullscreenExit";
import { MdLoop } from "@react-icons/all-files/md/MdLoop";
import { MdPictureInPictureAlt } from "@react-icons/all-files/md/MdPictureInPictureAlt";

type PlayerControlsProps = {
  playerRef: RefObject<any>;
};
const PlayerControls: React.FC<PlayerControlsProps> = ({ playerRef }) => {
  const { setState, ...state } = useContext(ReactPlayerProvider);
  const {
    playing,
    muted,
    loop,
    volume,
    playbackRate,
    duration,
    playedSeconds,
    pip,
  } = state;

  // --- handlers ---
  const handlePlayPause = () => {
    setState((prev) => ({ ...prev, playing: !prev.playing }));
  };

  const handleRestart = () => {
    setState((prev) => ({ ...prev, played: 0, playedSeconds: 0 }));
    const video = document.querySelector("video") as HTMLVideoElement | null;
    if (video) video.currentTime = 0;
  };

  const handleToggleLoop = () => {
    setState((prev) => ({ ...prev, loop: !prev.loop }));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number.parseFloat(e.target.value);
    setState((prev) => ({ ...prev, volume: val, muted: val === 0 }));
  };

  const handleToggleMuted = () => {
    setState((prev) => ({ ...prev, muted: !prev.muted }));
  };

  const handleSetPlaybackRate = (rate: number) => {
    setState((prev) => ({ ...prev, playbackRate: rate }));
  };

  const handleClickFullscreen = () => {
    const reactPlayer = document.querySelector(".react-player");
    if (reactPlayer && screenfull.isEnabled) {
      screenfull.toggle(reactPlayer as Element);
    }
  };

  const handleTogglePIP = () => {
    setState((prev) => ({ ...prev, pip: !prev.pip }));
  };

  const handleSeekChange = (type: "add" | "subtract" = "add") => {
    if (playerRef.current) {
      const duration = playerRef.current.duration || 0;
      let move = Math.min(playedSeconds + 5, duration);
      if (type === "subtract") {
        move = Math.max(0, playedSeconds - 5);
      }
      playerRef.current.currentTime = move;
    }
  };

  // --- helpers ---
  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const playbackSpeed = (
    <select
      value={playbackRate}
      onChange={(e) => handleSetPlaybackRate(Number(e.target.value))}
      className="bg-black/40 border border-gray-500 rounded px-1 text-xs"
    >
      {[0.5, 1, 1.25, 1.5, 2].map((rate) => (
        <option key={rate} value={rate}>
          {rate}x
        </option>
      ))}
    </select>
  );

  const fullScreen = (
    <button type="button" onClick={handleClickFullscreen}>
      {screenfull.isFullscreen ? (
        <MdFullscreenExit size={18} />
      ) : (
        <MdFullscreen size={18} />
      )}
    </button>
  );

  // --- UI ---
  return (
    <div className="flex flex-col gap-4 text-white px-3 py-2 text-sm z-[200] md:!flex-row md:items-center md:justify-between">
      {/* Left controls */}
      <div className="flex items-center gap-6 w-full md:!gap-3 md:!w-auto">
        {/* Play / Pause */}
        <button type="button" onClick={handlePlayPause}>
          {playing ? <FaPause size={18} /> : <FaPlay size={18} />}
        </button>

        {/* Loop */}
        <button
          type="button"
          onClick={handleToggleLoop}
          className={`hidden sm:!block ${loop ? "text-primary" : "text-white"}`}
        >
          <MdLoop size={18} />
        </button>

        {/* backwards by 5 seconds */}

        <button
          type="button"
          className="hidden sm:!block"
          onClick={() => handleSeekChange("subtract")}
        >
          <FaUndo size={16} />
        </button>

        {/* Time */}
        <span>
          {formatTime(playedSeconds)} / {formatTime(duration)}
        </span>

        {/* Move 5 seconds */}
        <button
          type="button"
          className="hidden sm:!block"
          onClick={() => handleSeekChange()}
        >
          <FaRedo size={16} />
        </button>

        <div className="md:hidden">{playbackSpeed}</div>
        <div className="md:hidden">{fullScreen}</div>
      </div>

      {/* Right controls */}
      <div className="hidden items-center gap-6 md:!flex md:!gap-3">
        {/* Volume */}
        <button type="button" onClick={handleToggleMuted}>
          {muted || volume === 0 ? (
            <FaVolumeMute size={18} />
          ) : (
            <FaVolumeUp size={18} />
          )}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step="any"
          value={muted ? 0 : volume}
          onChange={handleVolumeChange}
          className="w-20 accent-primary"
        />

        {/* Playback rate */}
        {playbackSpeed}

        {/* Picture-in-Picture */}
        <button
          type="button"
          onClick={handleTogglePIP}
          className={pip ? "text-primary" : ""}
        >
          <MdPictureInPictureAlt size={18} />
        </button>

        {/* Fullscreen */}
        {fullScreen}
      </div>
    </div>
  );
};

export default PlayerControls;
