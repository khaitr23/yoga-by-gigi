import Link from "next/link";
import ContentfulImage from "../ui/ContentfulImage";
import DateTimeComponent from "../ui/DateTimeComponent";
import styles from "../../styles/PostCard.module.css";

export default function PostCard({ post }) {
  const { title, slug, coverImage, date, summary } = post.fields;
  return (
    <li className={styles.postCards}>
      <Link href={`/blogs/${slug}`} aria-label={title}>
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
          <div>
            <DateTimeComponent
              dateString={date}
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
