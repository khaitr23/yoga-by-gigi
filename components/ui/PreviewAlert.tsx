import Link from "next/link";
import { useState } from "react";
import styles from "../../styles/PreviewAlert.module.css";

export default function PreviewAlert() {
  const [show, setShow] = useState(true);

  return (
    <div
      className={styles.alertBox}
      style={{ display: show ? "flex" : "none" }}
    >
      <a className={styles.closebtn} onClick={() => setShow(false)}>
        &times;
      </a>
      <a className={styles.warningText}>
        You are in preview mode. To exit preview mode:
      </a>
      <Link href="/api/exit-preview" className={styles.linkText}>
        Click here.
      </Link>
    </div>
  );
}
