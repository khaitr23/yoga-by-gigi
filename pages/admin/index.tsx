import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import type { GetServerSideProps } from "next";
import { requireAdminSession } from "../../lib/admin/auth";
import AdminLayout from "../../components/admin/AdminLayout";
import styles from "../../styles/admin.module.css";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const redirect = await requireAdminSession(ctx);
  if (redirect) return redirect;
  return { props: {} };
};

interface Counts {
  posts: number;
  retreats: number;
  sections: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [counts, setCounts] = useState<Counts | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/posts").then((r) => r.json()),
      fetch("/api/admin/retreats").then((r) => r.json()),
      fetch("/api/admin/sections").then((r) => r.json()),
    ]).then(([posts, retreats, sections]) => {
      setCounts({
        posts: posts.posts?.length ?? 0,
        retreats: retreats.retreats?.length ?? 0,
        sections: sections.sections?.length ?? 0,
      });
    });
  }, []);

  return (
    <AdminLayout>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>dashboard</h1>
      </div>

      <div className={styles.statGrid}>
        <div className={styles.statCard} onClick={() => router.push("/admin/posts")}>
          <span className={styles.statCount}>{counts?.posts ?? "—"}</span>
          <span className={styles.statLabel}>blog posts</span>
          <span className={styles.statAction}>manage →</span>
        </div>

        <div className={styles.statCard} onClick={() => router.push("/admin/retreats")}>
          <span className={styles.statCount}>{counts?.retreats ?? "—"}</span>
          <span className={styles.statLabel}>retreats</span>
          <span className={styles.statAction}>manage →</span>
        </div>

        <div className={styles.statCard} onClick={() => router.push("/admin/sections")}>
          <span className={styles.statCount}>{counts?.sections ?? "—"}</span>
          <span className={styles.statLabel}>homepage sections</span>
          <span className={styles.statAction}>manage →</span>
        </div>
      </div>
    </AdminLayout>
  );
}
