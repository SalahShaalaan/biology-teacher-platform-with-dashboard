import Image from "next/image";
import evolution from "@/public/evolution.png";
export default function EvolutionIcon() {
  return <Image src={ evolution} width={60} height={60} alt="Learn Icon" />;
}
