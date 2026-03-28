import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import type { GetServerSideProps } from "next";
import { requireAdminSession } from "../../../lib/admin/auth";
import AdminLayout from "../../../components/admin/AdminLayout";
import styles from "../../../styles/admin.module.css";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const redirect = await requireAdminSession(ctx);
  if (redirect) return redirect;
  return { props: {} };
};

interface Post {
  id: string;
  title: string;
  slug: string;
  date: string;
  published: boolean;
}

export default function AdminPostsIndex() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/posts");
    const data = await res.json();
    setPosts(data.posts ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
    if (res.ok) {
      setAlert({ type: "success", msg: "Post deleted." });
      load();
    } else {
      setAlert({ type: "error", msg: "Failed to delete post." });
    }
  }

  return (
    <AdminLayout>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>blog posts</h1>
        <button
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={() => router.push("/admin/posts/new")}
        >
          + new post
        </button>
      </div>

      {alert && (
        <div className={`${styles.alert} ${alert.type === "success" ? styles.alertSuccess : styles.alertError}`}>
          {alert.msg}
        </div>
      )}

      {loading ? (
        <p className={styles.listItemMeta}>loading…</p>
      ) : posts.length === 0 ? (
        <p className={styles.listItemMeta}>no posts yet.</p>
      ) : (
        <div className={styles.list}>
          {posts.map((post) => (
            <div key={post.id} className={styles.listItem}>
              <div className={styles.listItemMain}>
                <p className={styles.listItemTitle}>{post.title}</p>
                <p className={styles.listItemMeta}>
                  {post.date ? new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "no date"}
                  {" · "}
                  {post.published ? "published" : "draft"}
                </p>
              </div>
              <div className={styles.listItemActions}>
                <button
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  onClick={() => router.push(`/admin/posts/${post.id}`)}
                >
                  edit
                </button>
                <button
                  className={`${styles.btn} ${styles.btnDanger}`}
                  onClick={() => handleDelete(post.id, post.title)}
                >
                  delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
