import Link from "next/link";
import ContentfulImage from "../ui/ContentfulImage";
import DateTimeComponent from "../ui/DateTimeComponent";

export default function PostCard({ post }) {
  const { title, slug, coverImage, author, date, summary } = post.fields;
  return (
    <li className="postCards">
      <Link href={`/blogs/${slug}`} aria-label={title}>
        <div className="postCards">
          <div className="postCardImage">
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
          <div className="postCardText">
            <h3>{title}</h3>
            <div>
              <DateTimeComponent
                dateString={date}
                options={{}}
              ></DateTimeComponent>
            </div>
            <p>{summary}</p>
          </div>
        </div>
      </Link>
    </li>
  );
}
