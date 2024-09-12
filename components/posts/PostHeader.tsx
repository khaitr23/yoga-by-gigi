import Link from "next/link";
import Avatar from "../ui/Avatar";
import ContentfulImage from "../ui/ContentfulImage";
import DateTimeComponent from "../ui/DateTimeComponent";
import styles from "../../styles/Post.module.css";

export default function PostHeader({ post }) {
  const { title, coverImage, author, date } = post.fields;

  return (
    <>
      <h1 style={{ marginBottom: "0.5rem" }}>{title}</h1>
      <div id={styles.avatarNameAndDateContainer}>
        <Avatar name={author.fields.name} picture={author.fields.picture} />
        <DateTimeComponent dateString={date} options={{}} />
      </div>
      <div id={styles.coverImageContainer}>
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
    </>
  );
}
