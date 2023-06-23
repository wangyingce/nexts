import styles from "./sinfo.module.scss";
import Sinfo from "../icons/sinfo.png";
import NextImage from "next/image";

export function SinfoPage() {
  return (
    <div className={styles["sinfo-page"]}>
      <NextImage src={Sinfo} alt={""} />
    </div>
  );
}
