import React from "react";
import Link from "next/link";
import ContentfulImage from "../ui/ContentfulImage";
import DateTimeComponent from "../ui/DateTimeComponent";
import styles from "../../styles/PostCard.module.css";

export default function PostCard({ post, index = 0 }) {
  const { title, slug, coverImage, date, summary } = post.fields;

  return (
    <li
      className={styles.card}
      style={{ "--delay": `${index * 0.08}s` } as React.CSSProperties}
    >
      <Link href={`/blogs/${slug}`} aria-label={title} className={styles.cardLink}>
        {/* Image */}
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
          <DateTimeComponent
            dateString={date}
            options={{}}
            className={styles.cardDate}
          />
          {summary && (
            <p className={styles.cardSummary}>{summary}</p>
          )}
          <span className={styles.readMore}>
            read more{" "}
            <span className={styles.readMoreArrow} aria-hidden="true">→</span>
          </span>
        </div>
      </Link>
    </li>
  );
}
