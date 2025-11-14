import Image from "next/image";
import skelton from "@/public/skeleton-icon.png";
export default function SekeltonIcon() {
  return <Image src={skelton} width={80} height={80} quality={100} alt="Flask Icon" />;
}
