import Image from "next/image";
import explain from "@/public/explain.png";
export default function ExplainIcon() {
  return <Image src={ explain} width={60} height={60} alt="Learn Icon" />;
}
