"use client";

import {
    createContext,
    Dispatch,
    SetStateAction,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import ReactPlayer from "react-player";
import PlayButton from "./ui/PlayBtn";
import PlayerControlsWrapper from "./ui/PlayerControlsWrapper";

type VidPlayerProps = { src: string };

const initialState = {
  src: undefined,
  pip: false,
  playing: false,
  controls: false,
  light: false,
  volume: 1,
  muted: false,
  played: 0,
  loaded: 0,
  duration: 0,
  playbackRate: 1.0,
  loop: false,
  seeking: false,
  loadedSeconds: 0,
  playedSeconds: 0,
  hasPlayed: false,
  setState: () => {},
};

type PlayerState = Omit<typeof initialState, "src" | "setState"> & {
  src?: string;
  setState: Dispatch<SetStateAction<PlayerState>>;
};

export const ReactPlayerProvider = createContext<PlayerState>(initialState);

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

const Player: React.FC<VidPlayerProps> = ({ src }) => {
    
  const playerRef = useRef<HTMLVideoElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [state, setState] = useState<PlayerState>(initialState);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isYouTubeProcessing, setIsYouTubeProcessing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const hideTimer = useRef<NodeJS.Timeout | null>(null);
  const retryTimer = useRef<NodeJS.Timeout | null>(null);

  const { type: sourceType } = detectSource(src);
  const isYouTube = sourceType === "video/youtube";

  const showControls = () => {
    setControlsVisible(true);

    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      setControlsVisible(false);
    }, 2000);
  };

  useEffect(() => {
    showControls();

    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      if (retryTimer.current) clearTimeout(retryTimer.current);
    };
  }, []);

  useEffect(() => {
    const initializePlayer = async () => {
      if (!playerRef.current) return;

      if (iframeRef.current) {
        iframeRef.current.remove();
        iframeRef.current = null;
      }

      const { src: url, type, techOrder } = detectSource(src);

      if (type === "dailymotion") {
        if (containerRef.current) {
          if (iframeRef.current) {
            (iframeRef.current as any)?.remove?.();
            iframeRef.current = null;
          }

          playerRef.current.style.display = "none";

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
          if (iframeRef.current) {
            (iframeRef.current as any)?.remove?.();
            iframeRef.current = null;
          }

          playerRef.current.style.display = "none";

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
    };

    initializePlayer();

    return () => {
      if (playerRef.current) {
        playerRef.current = null;
      }

      if (iframeRef.current) {
        try {
          iframeRef.current.remove();
        } catch (error) {
          console.warn("Error removing iframe:", error);
        }
        iframeRef.current = null;
      }
    };
  }, [src]);

  const load = (src?: string) => {
    setState((prevState) => ({
      ...prevState,
      src,
      played: 0,
      loaded: 0,
      pip: false,
    }));
  };

  const setHasPlayed = () => {
    if (!state.hasPlayed) {
      setState((state) => ({ ...state, hasPlayed: true }));
    }
  };

  const handlePlayPause = () => {
    setHasPlayed();
    setState((prevState) => ({ ...prevState, playing: !prevState.playing }));
  };

  const handleRateChange = () => {
    const player = playerRef.current;
    if (!player) return;

    setState((prevState) => ({
      ...prevState,
      playbackRate: player.playbackRate,
    }));
  };

  const handlePlay = () => {
    setHasPlayed();
    setState((prevState) => ({ ...prevState, playing: true }));
  };

  const handleEnterPictureInPicture = () => {
    console.log("onEnterPictureInPicture");
    setState((prevState) => ({ ...prevState, pip: true }));
  };

  const handleLeavePictureInPicture = () => {
    console.log("onLeavePictureInPicture");
    setState((prevState) => ({ ...prevState, pip: false }));
  };

  const handlePause = () => {
    console.log("onPause");
    setState((prevState) => ({ ...prevState, playing: false }));
  };

  const handleProgress = () => {
    const player = playerRef.current;
    if (!player || state.seeking || !player.buffered?.length) return;

    console.log("onProgress");

    setState((prevState) => ({
      ...prevState,
      loadedSeconds: player.buffered?.end(player.buffered?.length - 1),
      loaded:
        player.buffered?.end(player.buffered?.length - 1) / player.duration,
    }));
  };

  const handleTimeUpdate = () => {
    const player = playerRef.current;
    if (!player || state.seeking) return;

    console.log("onTimeUpdate", player.currentTime);

    if (!player.duration) return;

    setState((prevState) => ({
      ...prevState,
      playedSeconds: player.currentTime,
      played: player.currentTime / player.duration,
    }));
  };

  const handleEnded = () => {
    console.log("onEnded");
    setState((prevState) => ({ ...prevState, playing: prevState.loop }));
  };

  const handleDurationChange = () => {
    const player = playerRef.current;
    if (!player) return;

    console.log("onDurationChange", player.duration);
    setState((prevState) => ({ ...prevState, duration: player.duration }));
  };

  const handleError = (e: any) => {
    console.log("onError", e);

    // Check if this is a YouTube video and if the error indicates processing
    if (isYouTube && !isYouTubeProcessing) {
      console.log(
        "YouTube video may still be processing, will retry in 30 seconds"
      );
      setIsYouTubeProcessing(true);

      // Set up retry
      retryTimer.current = setTimeout(() => {
        console.log("Retrying YouTube video...");
        setRetryCount((prev) => prev + 1);
        setIsYouTubeProcessing(false);
      }, 30000);
    }
  };

  const handleReady = () => {
    console.log("onReady");
    // Video is ready, clear any processing state
    if (isYouTubeProcessing) {
      setIsYouTubeProcessing(false);
      if (retryTimer.current) {
        clearTimeout(retryTimer.current);
        retryTimer.current = null;
      }
    }
  };

  const setPlayerRef = useCallback((player: HTMLVideoElement) => {
    if (!player) return;
    playerRef.current = player;
   
  }, []);

  // Show loading state while YouTube video is processing
  if (isYouTube && isYouTubeProcessing) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          aspectRatio: "16/9",
          backgroundColor: "#000",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          borderRadius: "5px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "4px solid #333",
            borderTop: "4px solid #fff",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <p style={{ marginTop: "20px", fontSize: "14px" }}>
          Video is being processed by YouTube...
        </p>
        <p style={{ marginTop: "10px", fontSize: "12px", color: "#888" }}>
          Retrying in 30 seconds
        </p>
        {retryCount > 0 && (
          <p style={{ marginTop: "5px", fontSize: "12px", color: "#666" }}>
            Attempt {retryCount + 1}
          </p>
        )}
      </div>
    );
  }

  return (
    <ReactPlayerProvider value={{ ...state, setState }}>
      <div
        className="w-full h-full relative"
        ref={containerRef}
        onMouseMove={showControls}
        onMouseEnter={showControls}
      >
        {playerRef?.current?.style?.display !== "none" && (
          <PlayerControlsWrapper
            playerRef={playerRef}
            controlsVisible={controlsVisible}
          />
        )}
        {playerRef?.current?.style?.display !== "none" && (
          <PlayButton onClick={handlePlayPause} />
        )}

        <ReactPlayer
          key={`player-${retryCount}`}
          src={src}
          ref={setPlayerRef}
          style={{
            width: "100%",
            height: "100%",
            aspectRatio: "16/9",
            background: "#000",
            borderRadius: "5px",
          }}
          className="react-player"
          pip={state.pip}
          playing={state.playing}
          controls={state.controls}
          light={state.light}
          loop={state.loop}
          playbackRate={state.playbackRate}
          volume={state.volume}
          muted={state.muted}
          config={{
            youtube: {
              color: "white",
            },
          }}
          onLoadStart={() => console.log("onLoadStart")}
          onReady={handleReady}
          onStart={(e) => console.log("onStart", e)}
          onPlay={handlePlay}
          onEnterPictureInPicture={handleEnterPictureInPicture}
          onLeavePictureInPicture={handleLeavePictureInPicture}
          onPause={handlePause}
          onRateChange={handleRateChange}
          onSeeking={(e) => console.log("onSeeking", e)}
          onSeeked={(e) => console.log("onSeeked", e)}
          onEnded={handleEnded}
          onError={handleError}
          onTimeUpdate={handleTimeUpdate}
          onProgress={handleProgress}
          onDurationChange={handleDurationChange}
        />
      </div>
    </ReactPlayerProvider>
  );
};

export default Player;
