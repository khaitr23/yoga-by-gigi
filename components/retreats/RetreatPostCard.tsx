import React from "react";
import Link from "next/link";
import ContentfulImage from "../ui/ContentfulImage";
import DateTimeComponent from "../ui/DateTimeComponent";
import styles from "../../styles/RetreatPostCard.module.css";

export default function RetreatPostCard({ retreat, index = 0 }) {
  const { title, slug, coverImage, summary, startDate, endDate } =
    retreat.fields;

  return (
    <li
      className={styles.card}
      style={{ "--delay": `${index * 0.08}s` } as React.CSSProperties}
    >
      <Link href={`/retreats/${slug}`} aria-label={title} className={styles.cardLink}>
        {/* Image + location badge */}
        <div className={styles.imageWrapper}>
          <ContentfulImage
            src={coverImage.fields.file.url}
            alt={`Cover image for ${title}`}
            fill
            className={styles.cardImage}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            style={{ objectFit: "cover" }}
          />
        </div>

        {/* Body */}
        <div className={styles.cardBody}>
          <h3 className={styles.cardTitle}>{title}</h3>

          {/* Date range */}
          <div className={styles.dateRange}>
            <DateTimeComponent dateString={startDate} options={{}} />
            <span className={styles.dateSep}>—</span>
            <DateTimeComponent dateString={endDate} options={{}} />
          </div>

          {summary && (
            <p className={styles.cardSummary}>{summary}</p>
          )}

          <span className={styles.readMore}>
            view details{" "}
            <span className={styles.readMoreArrow} aria-hidden="true">→</span>
          </span>
        </div>
      </Link>
    </li>
  );
}
