import Image from "next/image";

export default function BrandLogo({
  size = 42,
  priority = false,
}: {
  size?: number;
  priority?: boolean;
}) {
  return (
    <Image
      className="brand-logo-image"
      src="/tiger-tech-logo-small.svg"
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      priority={priority}
    />
  );
}
