import Link from "next/link";
import ContentfulImage from "../ui/ContentfulImage";
import DateTimeComponent from "../ui/DateTimeComponent";
import styles from "../../styles/RetreatPostCard.module.css";

export default function RetreatPostCard({ retreat }) {
  const { title, slug, coverImage, summary, startDate, endDate, location } =
    retreat.fields;
  return (
    <li className={`${styles.postCards}`}>
      <Link href={`/retreats/${slug}`} aria-label={title}>
        <div className={styles.postCardImage}>
          <ContentfulImage
            src={coverImage.fields.file.url}
            alt={`Cover Image for ${title}`}
            width={0}
            height={0}
            sizes="100vw"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
        <div className={styles.postCardText}>
          <h3 className={styles.postCardTitle}>{title}</h3>
          <div className={styles.dateContainer}>
            <DateTimeComponent
              dateString={startDate}
              options={{}}
              className={styles.postCardDate}
            ></DateTimeComponent>{" "}
            <p> to </p>
            <DateTimeComponent
              dateString={endDate}
              options={{}}
              className={styles.postCardDate}
            ></DateTimeComponent>
          </div>
          <p className={styles.postCardSummary}>{summary}</p>
        </div>
      </Link>
    </li>
  );
}
