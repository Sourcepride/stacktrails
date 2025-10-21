"use client";

import { FaStar } from "@react-icons/all-files/fa/FaStar";

interface StarsProps {
  rating: number;
  size?: "small" | "medium" | "large";
  editable?: boolean;
  onRatingChange?: (rating: number) => void;
  showRating?: boolean;
  className?: string;
}

const StarRating: React.FC<StarsProps> = ({
  rating,
  size = "small",
  editable = false,
  onRatingChange,
  showRating = false,
  className = "",
}) => {
  const sizeClasses = {
    small: "w-3 h-3",
    medium: "w-4 h-4",
    large: "w-5 h-5",
  };

  const handleStarClick = (starRating: number) => {
    if (editable && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const handleMouseEnter = (starRating: number) => {
    if (editable) {
      // You could add hover state logic here if needed
    }
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex">
        {[...Array(5)].map((_, index) => {
          const starRating = index + 1;
          const isFilled = starRating <= Math.floor(rating);
          const isHalfFilled =
            starRating === Math.ceil(rating) && rating % 1 !== 0;

          return (
            <button
              key={index}
              type="button"
              disabled={!editable}
              onClick={() => handleStarClick(starRating)}
              onMouseEnter={() => handleMouseEnter(starRating)}
              className={`${
                editable ? "cursor-pointer hover:scale-110" : "cursor-default"
              } transition-transform duration-150`}
            >
              <FaStar
                className={`${sizeClasses[size]} ${
                  isFilled || isHalfFilled ? "text-amber-500" : "text-gray-300"
                }`}
                style={{
                  clipPath: isHalfFilled
                    ? "polygon(0 0, 50% 0, 50% 100%, 0 100%)"
                    : "none",
                }}
              />
            </button>
          );
        })}
      </div>
      {showRating && (
        <span className="text-sm text-gray-600 ml-1">{rating.toFixed(1)}</span>
      )}
    </div>
  );
};

export default StarRating;
