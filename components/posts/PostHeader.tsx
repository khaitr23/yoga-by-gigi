import Avatar from "../ui/Avatar";
import ContentfulImage from "../ui/ContentfulImage";
import DateTimeComponent from "../ui/DateTimeComponent";
import styles from "../../styles/Post.module.css";

export default function PostHeader({ post }) {
  const { title, coverImage, author, date } = post.fields;

  return (
    <div>
      <span className={styles.postLabel}>journal</span>
      <h1 className={styles.postTitle}>{title}</h1>

      <div className={styles.postMeta}>
        <Avatar name={author.fields.name} picture={author.fields.picture} />
        <div className={styles.postDate}>
          <DateTimeComponent dateString={date} options={{}} />
        </div>
      </div>

      <div className={styles.coverImageWrapper}>
        <ContentfulImage
          src={coverImage.fields.file.url}
          alt={`Cover image for ${title}`}
          fill
          className={styles.coverImage}
          sizes="(max-width: 800px) 100vw, 68ch"
          style={{ objectFit: "cover" }}
        />
      </div>
    </div>
  );
}
