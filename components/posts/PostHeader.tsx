import Link from "next/link";
import Avatar from "../ui/Avatar";
import ContentfulImage from "../ui/ContentfulImage";
import DateTimeComponent from "../ui/DateTimeComponent";

export default function PostHeader({ post }) {
  const { title, coverImage, author, date } = post.fields;

  return (
    <>
      <h2>
        <Link href="/blogs">←Back to Blogs</Link>
      </h2>
      <br />
      <h2>{title}</h2>
      <div id="avatarNameAndDateContainer">
        <Avatar name={author.fields.name} picture={author.fields.picture} />
        <DateTimeComponent dateString={date} options={{}} />
      </div>
      <div id="coverImageContainer">
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
