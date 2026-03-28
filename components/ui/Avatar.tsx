import ContentfulImage from "./ContentfulImage";
import styles from "../../styles/Avatar.module.css";

export default function Avatar({ name, picture }) {
  return (
    <div className={styles.avatar}>
      <div className={styles.pictureWrapper}>
        <ContentfulImage
          src={picture.fields.file.url}
          fill
          style={{ objectFit: "cover" }}
          alt={name}
        />
      </div>
      <span className={styles.name}>{name}</span>
    </div>
  );
}
