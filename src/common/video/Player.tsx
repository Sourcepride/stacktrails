"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import Player from "video.js/dist/types/player";
import "video.js/dist/video-js.css";
import "videojs-youtube";

// import {
//   Player as ShakaPlayer,
//   ui as ShakaUI,
// } from "shaka-player/dist/shaka-player.ui";

// import "shaka-player/dist/controls.css";

interface Props {
  url: string;
}

function customizeUdemyLayout(player: Player) {
  const controlBar = (player as any).controlBar;

  if (!controlBar) return;

  // Progress control
  const progressControl = controlBar.progressControl.el();

  // Container for other controls
  const controlsRow = document.createElement("div");
  controlsRow.className = "udemy-controls-row";

  // Move everything except progress bar into this row
  const children = Array.from(controlBar.el().children);
  children.forEach((child: any) => {
    if (!child.classList.contains("vjs-progress-control")) {
      controlsRow.appendChild(child);
    }
  });

  // Clear original control bar
  controlBar.el().innerHTML = "";

  // Insert progress bar first
  controlBar.el().appendChild(progressControl);

  // Insert controls row below
  controlBar.el().appendChild(controlsRow);
}

function detectSource(url: string) {
  if (/youtube\.com|youtu\.be/.test(url)) {
    return { src: url, type: "video/youtube", techOrder: ["youtube"] };
  }

  if (/dailymotion\.com/.test(url)) {
    return { src: url, type: "dailymotion", techOrder: [] };
  }

  if (/drive\.google\.com/.test(url)) {
    const match = url.match(/[-\w]{25,}/);
    const fileId = match ? match[0] : null;

    if (fileId) {
      return {
        src: `https://drive.google.com/file/d/${fileId}/preview`,
        type: "google_drive",
        techOrder: ["html5"],
      };
    }
  }

  if (/dropbox\.com|dropboxusercontent\.com/.test(url)) {
    return {
      src: url.replace("?dl=0", "?raw=1"),
      type: "video/mp4",
      techOrder: ["html5"],
    };
  }

  return { src: url, type: "video/mp4", techOrder: ["html5"] };
}

function VideoPlayerClient({ url }: Props) {
  type VideoJsPlayer = Player;
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<VideoJsPlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initializePlayer = async () => {
      if (!videoRef.current || !isMounted) return;

      try {
        // Clean up existing player first
        if (playerRef.current) {
          playerRef.current.dispose();
          playerRef.current = null;
        }

        // Clean up existing iframe
        if (iframeRef.current) {
          iframeRef.current.remove();
          iframeRef.current = null;
        }

        const vjs = (await import("video.js")).default;
        const { src, type, techOrder } = detectSource(url);

        if (type === "dailymotion") {
          if (containerRef.current) {
            // Clean up existing iframe (if any)
            if (iframeRef.current) {
              (iframeRef.current as any)?.remove?.();
              iframeRef.current = null;
            }

            videoRef.current.style.display = "none";
            const iframe = document.createElement("iframe");
            iframe.width = "100%";
            iframe.height = "100%";
            iframe.src = url.replace(
              "dailymotion.com/video",
              "dailymotion.com/embed/video"
            );
            iframe.allow = "autoplay; fullscreen";
            iframe.style.border = "none";
            containerRef.current.appendChild(iframe);
            iframeRef.current = iframe;
          }
          return;
        }

        if (type === "google_drive") {
          if (containerRef.current) {
            // Clean up existing iframe (if any)
            if (iframeRef.current) {
              (iframeRef.current as any)?.remove?.();
              iframeRef.current = null;
            }

            videoRef.current.style.display = "none";

            const iframe = document.createElement("iframe");
            iframe.width = "100%";
            iframe.height = "100%";
            iframe.src = src;
            iframe.allow = "autoplay; fullscreen";
            iframe.style.border = "none";

            containerRef.current.appendChild(iframe);
            iframeRef.current = iframe;
          }
          return;
        }

        // Show video element for non-iframe videos
        if (videoRef.current) {
          videoRef.current.style.display = "block";
        }

        // Wait a tick to ensure DOM is ready
        await new Promise((resolve) => setTimeout(resolve, 0));

        if (!isMounted || !videoRef.current) return;

        const player = vjs(videoRef.current, {
          controls: true,
          fluid: false, // Disable fluid to prevent aspect ratio constraints
          responsive: false, // Disable responsive to prevent aspect ratio constraints
          fill: true, // Enable fill to use full container size
          playbackRates: [0.5, 1, 1.5, 2],
          techOrder,
          sources: [{ src, type }],
        });

        playerRef.current = player;

        player.ready(() => {
          console.log("Video.js player is ready");
          // Force the player to fill the container
          if (playerRef.current) {
            playerRef.current.fill(true);
            customizeUdemyLayout(playerRef.current);
          }
        });

        // Handle errors
        player.on("error", (error: any) => {
          console.error("Video.js error:", error);
        });
      } catch (error) {
        console.error("Error initializing Video.js:", error);
      }
    };

    initializePlayer();

    return () => {
      isMounted = false;

      // Clean up player
      if (playerRef.current) {
        try {
          playerRef.current.dispose();
        } catch (error) {
          console.warn("Error disposing player:", error);
        }
        playerRef.current = null;
      }

      // Clean up iframe
      if (iframeRef.current) {
        try {
          iframeRef.current.remove();
        } catch (error) {
          console.warn("Error removing iframe:", error);
        }
        iframeRef.current = null;
      }
    };
  }, [url]);

  return (
    <div
      ref={containerRef}
      data-vjs-player
      style={{ width: "100%", height: "100%" }} // Changed to 100% height
    >
      <video
        ref={videoRef}
        className="video-js vjs-big-play-centered vjs-fill"
        playsInline
        controls
        preload="metadata"
        style={{ width: "100%", height: "100%" }} // Added inline styles for full size
      />
    </div>
  );
}

// Export with no SSR
const VideoPlayer = dynamic(() => Promise.resolve(VideoPlayerClient), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: "100%", // Changed to 100% to match parent
        backgroundColor: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
      }}
    >
      Loading video player...
    </div>
  ),
});

export default VideoPlayer;
