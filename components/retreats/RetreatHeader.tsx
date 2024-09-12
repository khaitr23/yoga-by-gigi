import Link from "next/link";
import Avatar from "../ui/Avatar";
import ContentfulImage from "../ui/ContentfulImage";
import DateTimeComponent from "../ui/DateTimeComponent";
import styles from "../../styles/Post.module.css";

export default function RetreatHeader({ retreat }) {
  const { title, coverImage, author, startDate, endDate } = retreat.fields;

  return (
    <>
      <h2>
        <Link href="/retreats">←Back to Retreats</Link>
      </h2>
      <br />
      <h2>{title}</h2>
      <div id={styles.avatarNameAndDateContainer}>
        <Avatar name={author.fields.name} picture={author.fields.picture} />
        <DateTimeComponent dateString={startDate} options={{}} />
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
            height: "auto%",
            objectFit: "cover",
          }}
        />
      </div>
    </>
  );
}
