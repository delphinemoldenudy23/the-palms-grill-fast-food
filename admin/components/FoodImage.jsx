import { useEffect, useState } from "react";
import { resolveImageUrl } from "../lib/imageUrl";

export default function FoodImage({ src, alt, className }) {
  const [imgSrc, setImgSrc] = useState(() => resolveImageUrl(src) || "");
  const [error, setError] = useState(false);

  useEffect(() => {
    const resolved = resolveImageUrl(src) || "";
    setImgSrc(resolved);
    setError(false);
    
    // Log for debugging
    if (process.env.NODE_ENV !== "production") {
      console.log("FoodImage:", { src, resolved });
    }
  }, [src]);

  // Don't show anything if there's no image
  if (!imgSrc) {
    return (
      <div className={`${className} bg-gray-200 flex items-center justify-center text-gray-400 text-xs`}>
        No image
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} bg-gray-200 flex items-center justify-center text-gray-400 text-xs`}>
        Failed to load
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      loading="lazy"
      onError={(e) => {
        console.error("FoodImage failed to load:", imgSrc, e);
        setError(true);
      }}
    />
  );
}
