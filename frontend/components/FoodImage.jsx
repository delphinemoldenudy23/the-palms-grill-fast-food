import { useEffect, useState } from "react";
import { resolveImageUrl } from "../lib/imageUrl";

export default function FoodImage({ src, alt, className }) {
  const [imgSrc, setImgSrc] = useState(() => resolveImageUrl(src) || "");

  useEffect(() => {
    setImgSrc(resolveImageUrl(src) || "");
  }, [src]);

  // Don't show anything if there's no image
  if (!imgSrc) {
    return (
      <div className={`${className} bg-gray-200 flex items-center justify-center text-gray-400 text-xs`}>
        No image
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => {
        // If image fails to load, show placeholder instead of fallback
        setImgSrc("");
      }}
    />
  );
}
