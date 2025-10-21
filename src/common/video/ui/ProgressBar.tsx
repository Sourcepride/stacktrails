import { RefObject, useContext } from "react";
import { ReactPlayerProvider } from "../VidPlayer";

type ProgressBarProps = {
  playerRef: RefObject<any>;
};

const ProgressBar: React.FC<ProgressBarProps> = ({ playerRef }) => {
  const { loaded, played, setState } = useContext(ReactPlayerProvider);

  const handleSeekMouseDown = () => {
    setState((prev) => ({ ...prev, seeking: true }));
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setState((prev) => ({ ...prev, played: value }));
  };

  const handleSeekMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
    const value = parseFloat((e.target as HTMLInputElement).value);
    setState((prev) => ({ ...prev, seeking: false }));

    if (playerRef.current) {
      const duration = playerRef.current.duration || 0;
      playerRef.current.currentTime = value * duration;
    }
  };

  return (
    <div className="relative z-[100] w-[97%]  h-2 bg-[rgba(255,255,255,0.5)] rounded transition-all duration-200 hover:h-4">
      {/* Buffered */}
      <div
        className="absolute top-0 left-0 h-full bg-secondary rounded"
        style={{ width: `${loaded * 100}%` }}
      />
      {/* Played */}
      <div
        className="absolute top-0 left-0 h-full bg-primary rounded"
        style={{ width: `${played * 100}%` }}
      />
      {/* Invisible slider */}
      <input
        type="range"
        min={0}
        max={1}
        step="any"
        value={played}
        onMouseDown={handleSeekMouseDown}
        onChange={handleSeekChange}
        onMouseUp={handleSeekMouseUp}
        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
      />
    </div>
  );
};

export default ProgressBar;
