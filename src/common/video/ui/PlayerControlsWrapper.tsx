"use client";

import { RefObject } from "react";
import PlayerControls from "./PlayerControls";
import ProgressBar from "./ProgressBar";

type PlayerControlsWrapperProps = {
  playerRef: RefObject<any>;
  controlsVisible: boolean;
};
const PlayerControlsWrapper: React.FC<PlayerControlsWrapperProps> = ({
  playerRef,
  controlsVisible,
}) => {
  return (
    <div
      className={`absolute bg-black/60 bottom-0 left-0 right-0 z-[100] flex flex-col gap-2 py-2  transition-opacity duration-300 ${
        controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex items-center justify-center w-full">
        <ProgressBar playerRef={playerRef} />
      </div>
      <PlayerControls playerRef={playerRef} />
    </div>
  );
};

export default PlayerControlsWrapper;
