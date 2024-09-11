import Link from "next/link";
import { client } from "../../lib/contentful/client";
import PostCard from "../../components/posts/PostCard";
import { GetStaticProps } from "next";

export default function Blogs({ posts }) {
  return (
    <main>
      <div id="blogs" className="section">
        <h1>Blogs.</h1>
        <p>You can check out my blogs below!</p>
      </div>
      <div className="blogListContainer">
        <ul className="section blogs">
          {posts.map((post) => (
            <PostCard key={post.fields.slug} post={post} />
          ))}
        </ul>
      </div>
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const response = await client.getEntries({ content_type: "post" });
  return {
    props: {
      posts: response.items,
      revalidate: 60,
    },
  };
};
