import { client } from "../../lib/contentful/client";
import { GetStaticProps } from "next";
import RetreatPostCard from "../../components/retreats/RetreatPostCard";
import styles from "../../styles/Retreats.module.css";
import { useState } from "react";

export default function Retreats({ retreats }) {
  const [showUpcoming, setShowUpcoming] = useState(true);
  const currentDate = new Date();
  const upcomingRetreats = retreats.filter(
    (retreat) => new Date(retreat.fields.startDate) >= currentDate
  );
  const pastRetreats = retreats.filter(
    (retreat) => new Date(retreat.fields.endDate) < currentDate
  );

  return (
    <main>
      <div id={styles.blogsTitle} className="section">
        <h1>Retreats.</h1>
        <p>You can check out my retreats below!</p>
      </div>
      <div className={`${styles.buttonContainer}`}>
        <p
          className={`${
            showUpcoming ? styles.activeTextButton : styles.inactiveTextButton
          } ${styles.textButton}`}
          onClick={() => setShowUpcoming(true)}
        >
          Current & Upcoming
        </p>
        <p
          className={`${
            !showUpcoming ? styles.activeTextButton : styles.inactiveTextButton
          } ${styles.textButton}`}
          onClick={() => setShowUpcoming(false)}
        >
          Past Retreats
        </p>
      </div>

      <div style={{ padding: "2rem", paddingBottom: "6rem" }}>
        <div style={{ paddingBottom: "6rem" }}>
          <div className={styles.blogListContainer}>
            <ul className={styles.blogGrid}>
              {showUpcoming
                ? upcomingRetreats.map((retreat) => (
                    <RetreatPostCard
                      key={retreat.fields.slug}
                      retreat={retreat}
                    />
                  ))
                : pastRetreats.map((retreat) => (
                    <RetreatPostCard
                      key={retreat.fields.slug}
                      retreat={retreat}
                    />
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
  const sortedRetreats = response.items.sort((a, b) => {
    if (a.startDate < b.startDate) {
      return 1;
    } else {
      return -1;
    }
  });
  return {
    props: {
      retreats: sortedRetreats,
      revalidate: 60,
    },
  };
};
