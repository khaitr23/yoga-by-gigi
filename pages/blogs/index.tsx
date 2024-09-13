import { client } from "../../lib/contentful/client";
import PostCard from "../../components/posts/PostCard";
import { GetStaticProps } from "next";
import styles from "../../styles/Blogs.module.css";

export default function Blogs({ posts }) {
  return (
    <main>
      <div id={styles.blogsTitle} className="section">
        <h1>Blogs.</h1>
        <p>You can check out my blogs below!</p>
      </div>

      <div style={{ padding: "2rem", paddingBottom: "6rem" }}>
        <div style={{ paddingBottom: "6rem" }}>
          <div className={styles.blogListContainer}>
            <ul className={styles.blogGrid}>
              {posts.map((post) => (
                <PostCard key={post.fields.slug} post={post} />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const response = await client.getEntries({ content_type: "post" });
  console.log(response.items[0].fields);
  const sortedBlogs = response.items.sort((a, b) => {
    if (a.fields.date < b.fields.date) {
      return 1;
    } else {
      return -1;
    }
  });
  return {
    props: {
      posts: sortedBlogs,
      revalidate: 60,
    },
  };
};
