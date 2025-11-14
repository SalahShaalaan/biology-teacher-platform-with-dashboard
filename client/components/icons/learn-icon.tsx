import Image from "next/image";
import learn from "@/public/learning.png";
export default function LearnIcon() {
  return <Image src={learn} width={60} height={60} alt="Learn Icon" />;
}
