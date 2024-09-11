import { client } from "../../lib/contentful/client";
import { GetStaticProps } from "next";
import RetreatPostCard from "../../components/retreats/RetreatPostCard";
import styles from "../../styles/Retreats.module.css";

export default function Retreats({ retreat }) {
  return (
    <main>
      <div id={styles.blogsTitle} className="section">
        <h1>Retreats.</h1>
        <p>You can check out my retreats below!</p>
      </div>

      <div style={{ padding: "2rem", paddingBottom: "6rem" }}>
        <div style={{ paddingBottom: "6rem" }}>
          <div className={styles.blogListContainer}>
            <ul className={styles.blogGrid}>
              {retreat.map((retreat) => (
                <RetreatPostCard key={retreat.fields.slug} retreat={retreat} />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const response = await client.getEntries({ content_type: "retreat" });
  return {
    props: {
      retreat: response.items,
      revalidate: 60,
    },
  };
};
