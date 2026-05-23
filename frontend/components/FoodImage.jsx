import { useEffect, useState } from "react";
import { FALLBACK_IMG, withFallback } from "../lib/imageUrl";

export default function FoodImage({ src, alt, className }) {
  const [imgSrc, setImgSrc] = useState(() => withFallback(src));

  useEffect(() => {
    setImgSrc(withFallback(src));
  }, [src]);

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => {
        if (imgSrc !== FALLBACK_IMG) setImgSrc(FALLBACK_IMG);
      }}
    />
  );
}
