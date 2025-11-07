import { useSignedUrls } from "@/hooks/useSignedUrls";
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { Blurhash } from "react-blurhash";

interface SignedUrlImageProps {
  thumbnailPath?: string | null;
  fullSizePath?: string | null;
  blurhash?: string | null;
  blobUrl?: string | null;
  size?: "small" | "medium" | "large";
  className?: string;
  preferFullSize?: boolean;
  priority?: boolean;
  isDragging?: boolean;
}

export const SignedUrlImage = React.memo(
  ({
    thumbnailPath,
    fullSizePath,
    blurhash,
    blobUrl,
    // size = "medium",
    className,
    preferFullSize = false,
    priority = false,
    isDragging = false,
  }: SignedUrlImageProps) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageSrc, setImageSrc] = useState<string | null>(null);

    const pathsToFetch = [thumbnailPath, fullSizePath].filter(Boolean) as string[];
    const { signedUrls, isLoading } = useSignedUrls(pathsToFetch);

    useEffect(() => {
      const thumbnailUrl = thumbnailPath ? signedUrls[thumbnailPath] : null;
      const fullSizeUrl = fullSizePath ? signedUrls[fullSizePath] : null;

      // If we have a path to a remote file, ignore any local blobUrl
      if (fullSizePath && fullSizeUrl) {
        if (preferFullSize) {
          setImageSrc(fullSizeUrl);
        } else if (thumbnailUrl) {
          setImageSrc(thumbnailUrl);
        } else {
          // Fallback to full size if thumbnail isn't ready
          setImageSrc(fullSizeUrl);
        }
        return;
      }

      // Otherwise, use the blobUrl for local previews
      if (blobUrl) {
        setImageSrc(blobUrl);
        return;
      }
    }, [signedUrls, thumbnailPath, fullSizePath, blobUrl, preferFullSize]);

    const handleImageLoad = () => {
      setImageLoaded(true);
    };

    const sizeClasses = {
      small: "w-16 h-28",
      medium: "w-32 h-56",
      large: "w-full h-full",
    };

    return (
      <div className={cn("relative aspect-[9/16]", sizeClasses["large"], className)}>
        {!isLoading && imageSrc && (
          <img
            src={imageSrc}
            onLoad={handleImageLoad}
            className={cn("object-cover w-full h-full", { "opacity-0": !imageLoaded && !isDragging })}
            alt="Signed content"
            loading={priority ? "eager" : "lazy"}
          />
        )}
        {!imageLoaded && blurhash && !isDragging && (
          <Blurhash hash={blurhash} width="100%" height="100%" className="absolute top-0 left-0" />
        )}
      </div>
    );
  }
);
