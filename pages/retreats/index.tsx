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

  const displayed = showUpcoming ? upcomingRetreats : pastRetreats;

  return (
    <main>
      {/* Page header */}
      <header className={styles.pageHeader}>
        <div className={styles.pageHeaderInner}>
          <span className={styles.pageLabel}>immersions</span>
          <h1 className={styles.pageTitle}>Retreats</h1>
          <p className={styles.pageSubtitle}>
            spaces to slow down, reconnect &amp; go deeper
          </p>
        </div>
      </header>
      <div className={styles.pageHeaderRule} />

      {/* Tab bar */}
      <div className={styles.tabBar}>
        <button
          className={`${styles.tab} ${showUpcoming ? styles.activeTab : ""}`}
          onClick={() => setShowUpcoming(true)}
        >
          Current &amp; Upcoming
        </button>
        <button
          className={`${styles.tab} ${!showUpcoming ? styles.activeTab : ""}`}
          onClick={() => setShowUpcoming(false)}
        >
          Past Retreats
        </button>
      </div>

      {/* Card grid */}
      <div className={styles.gridWrapper}>
        <ul className={styles.grid}>
          {displayed.length === 0 ? (
            <li className={styles.emptyState}>
              <p>
                {showUpcoming
                  ? "No upcoming retreats at the moment — check back soon."
                  : "No past retreats to show yet."}
              </p>
            </li>
          ) : (
            displayed.map((retreat, index) => (
              <RetreatPostCard
                key={retreat.fields.slug}
                retreat={retreat}
                index={index}
              />
            ))
          )}
        </ul>
      </div>
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const response = await client.getEntries({ content_type: "retreat" });
  const sortedRetreats = response.items.sort((a, b) =>
    a.fields.startDate < b.fields.startDate ? 1 : -1
  );
  return {
    props: { retreats: sortedRetreats, revalidate: 60 },
  };
};
