import Image from "next/image";
import flas from "@/public/flask.png";
export default function FlaskIcon() {
  return <Image src={flas} width={60} height={60} alt="Flask Icon" />;
}
