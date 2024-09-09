import Link from "next/link";
import ContentfulImage from "../ui/ContentfulImage";
import DateTimeComponent from "../ui/DateTimeComponent";

export default function PostCard({ post }) {
  const { title, slug, coverImage, author, date, summary } = post.fields;
  return (
    <li className="postCards">
      <Link href={`/blogs/${slug}`} aria-label={title}>
        <ContentfulImage
          src={coverImage.fields.file.url}
          alt={`Cover Image for ${title}`}
          width={coverImage.fields.file.details.image.width}
          height={coverImage.fields.file.details.image.height}
          layout="responsive"
        />
        <h2>{title}</h2>
        <div>
          <DateTimeComponent dateString={date} options={{}}></DateTimeComponent>
        </div>
        <p>{summary}</p>
      </Link>
    </li>
  );
}
