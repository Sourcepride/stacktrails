"use client";

import { useEffect, useRef, useState } from "react";

const heroImages = [
  "learning-animate.svg",
  "remote-team-animate_1.svg",
  "remote-team-animate.svg",
  "studying-animate.svg",
  "telework-animate.svg",
];

type HeroImageProps = {};
const HeroImage: React.FC<HeroImageProps> = ({}) => {
  const [index, setIndex] = useState(0);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    const interval = 7000;

    const animeCallback = (timestamp: number) => {
      const lastTime = lastTimeRef.current;
      if (timestamp - lastTime >= interval) {
        lastTimeRef.current = timestamp;
        setIndex((state) => (state >= heroImages.length - 1 ? 0 : state + 1));
      }

      requestAnimationFrame(animeCallback);
    };

    requestAnimationFrame(animeCallback);
  }, []);

  return (
    <div className="hidden w-full md:w-1/2 max-w-[520px] lg:block">
      <img
        src={heroImages[index]}
        alt="hero image"
        className="w-full h-[500px] -translate-y-[18%]"
      />
    </div>
  );
};

export default HeroImage;
