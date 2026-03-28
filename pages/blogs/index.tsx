import { client } from "../../lib/contentful/client";
import PostCard from "../../components/posts/PostCard";
import { GetStaticProps } from "next";
import styles from "../../styles/Blogs.module.css";

export default function Blogs({ posts }) {
  return (
    <main>
      {/* Page header */}
      <header className={styles.pageHeader}>
        <div className={styles.pageHeaderInner}>
          <span className={styles.pageLabel}>journal</span>
          <h1 className={styles.pageTitle}>Blogs</h1>
          <p className={styles.pageSubtitle}>
            reflections on practice, movement &amp; stillness
          </p>
        </div>
      </header>
      <div className={styles.pageHeaderRule} />

      {/* Card grid */}
      <div className={styles.gridWrapper}>
        <ul className={styles.grid}>
          {posts.length === 0 ? (
            <li className={styles.emptyState}>
              <p>No posts yet — check back soon.</p>
            </li>
          ) : (
            posts.map((post, index) => (
              <PostCard key={post.fields.slug} post={post} index={index} />
            ))
          )}
        </ul>
      </div>
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const response = await client.getEntries({ content_type: "post" });
  const sortedBlogs = response.items.sort((a, b) =>
    a.fields.date < b.fields.date ? 1 : -1
  );
  return {
    props: { posts: sortedBlogs, revalidate: 60 },
  };
};
