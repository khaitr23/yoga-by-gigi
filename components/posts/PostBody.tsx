import RichText from "../RichText";

export default function PostBody({ post }) {
  const { content } = post.fields;

  return (
    <div>
      <RichText content={content} />
    </div>
  );
}
