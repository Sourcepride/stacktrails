"use client";

import { FaPlay } from "@react-icons/all-files/fa/FaPlay";
import { useContext, useEffect, useRef, useState } from "react";
import { ReactPlayerProvider } from "../VidPlayer";

export default function PlayButton({ onClick }: { onClick?: () => void }) {
  const { hasPlayed } = useContext(ReactPlayerProvider);

  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimer = useRef<NodeJS.Timeout | null>(null);

  const showControls = () => {
    setControlsVisible(true);

    // reset timer
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      setControlsVisible(false);
    }, 2000);
  };

  useEffect(() => {
    // show controls initially
    showControls();

    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  return (
    <>
      <div
        onMouseMove={showControls}
        onMouseEnter={showControls}
        className="
    
    absolute 
        left-1/2 
        top-1/2 
        -translate-x-1/2 
        -translate-y-1/2
        w-20 h-20
        rounded-full
        z-[1]
    "
      ></div>
      <button
        onClick={onClick}
        type="button"
        onMouseMove={showControls}
        onMouseEnter={showControls}
        className={`
        absolute 
        left-1/2 
        top-1/2 
        -translate-x-1/2 
        -translate-y-1/2
        flex items-center justify-center
        w-20 h-20
        rounded-full
        bg-[rgba(255,255,255,0.15)]
        hover:scale-125
        z-[100]
       transition-[opacity,transform]  duration-300 ${
         controlsVisible || !hasPlayed
           ? "opacity-100"
           : "opacity-0  pointer-events-none"
       }
      `}
      >
        <div className="bg-white w-[70%] h-[70%] flex items-center justify-center rounded-full ">
          <FaPlay className="text-blue-500 text-2xl ml-1" />
        </div>
      </button>
    </>
  );
}
