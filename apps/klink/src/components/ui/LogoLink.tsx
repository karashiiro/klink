import { Image } from "@tamagui/image";
import { Link } from "react-router";

export interface LogoLinkProps {
  opacity?: number;
}

export function LogoLink({ opacity }: LogoLinkProps) {
  return (
    <Link to="/" aria-label="Go to home page">
      <Image
        style={{ opacity }}
        source={{
          width: 150,
          height: 75,
          uri: "/klink_static.webp",
        }}
      />
    </Link>
  );
}
