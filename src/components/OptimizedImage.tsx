import Image from "next/image";

type OptimizedImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
  objectFit?: "cover" | "contain";
};

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className = "",
  objectFit = "cover",
}: OptimizedImageProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        quality={85}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className={`h-full w-full object-${objectFit}`}
        loading={priority ? "eager" : "lazy"}
      />
    </div>
  );
}
