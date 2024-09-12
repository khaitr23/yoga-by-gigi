import Link from "next/link";
import Avatar from "../ui/Avatar";
import ContentfulImage from "../ui/ContentfulImage";
import DateTimeComponent from "../ui/DateTimeComponent";
import styles from "../../styles/Post.module.css";

export default function RetreatHeader({ retreat }) {
  const { title, coverImage, author, startDate, endDate } = retreat.fields;

  return (
    <>
      <h1 style={{ marginBottom: "0.5rem" }}>{title}</h1>
      <div id={styles.avatarNameAndDateContainer}>
        <Avatar name={author.fields.name} picture={author.fields.picture} />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          marginBottom: "0px",
          fontWeight: "bold",
        }}
      >
        <DateTimeComponent dateString={startDate} options={{}} />
        <p style={{ paddingLeft: "1rem", paddingRight: "1rem" }}> to </p>
        <DateTimeComponent dateString={endDate} options={{}} />
      </div>

      <div id={styles.coverImageContainer}>
        <ContentfulImage
          src={coverImage.fields.file.url}
          alt={`Cover Image for ${title}`}
          width={0}
          height={0}
          sizes="100vw"
          style={{
            width: "auto",
            height: "auto",
            objectFit: "cover",
          }}
        />
      </div>
    </>
  );
}
