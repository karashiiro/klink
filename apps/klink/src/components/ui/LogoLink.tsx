import { Image } from "@tamagui/image";
import { Link } from "react-router";

export function LogoLink() {
  return (
    <Link to="/" aria-label="Go to home page">
      <Image
        source={{
          width: 150,
          height: 75,
          uri: "/klink_static.webp",
        }}
      />
    </Link>
  );
}
