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

interface Retreat {
  id: string;
  title: string;
  slug: string;
  startDate: string;
  endDate: string;
  published: boolean;
}

export default function AdminRetreatsIndex() {
  const router = useRouter();
  const [retreats, setRetreats] = useState<Retreat[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/retreats");
    const data = await res.json();
    setRetreats(data.retreats ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/retreats/${id}`, { method: "DELETE" });
    if (res.ok) {
      setAlert({ type: "success", msg: "Retreat deleted." });
      load();
    } else {
      setAlert({ type: "error", msg: "Failed to delete retreat." });
    }
  }

  function formatDate(d: string) {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <AdminLayout>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>retreats</h1>
        <button
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={() => router.push("/admin/retreats/new")}
        >
          + new retreat
        </button>
      </div>

      {alert && (
        <div className={`${styles.alert} ${alert.type === "success" ? styles.alertSuccess : styles.alertError}`}>
          {alert.msg}
        </div>
      )}

      {loading ? (
        <p className={styles.listItemMeta}>loading…</p>
      ) : retreats.length === 0 ? (
        <p className={styles.listItemMeta}>no retreats yet.</p>
      ) : (
        <div className={styles.list}>
          {retreats.map((r) => (
            <div key={r.id} className={styles.listItem}>
              <div className={styles.listItemMain}>
                <p className={styles.listItemTitle}>{r.title}</p>
                <p className={styles.listItemMeta}>
                  {formatDate(r.startDate)}{r.endDate ? ` – ${formatDate(r.endDate)}` : ""}
                  {" · "}
                  {r.published ? "published" : "draft"}
                </p>
              </div>
              <div className={styles.listItemActions}>
                <button
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  onClick={() => router.push(`/admin/retreats/${r.id}`)}
                >
                  edit
                </button>
                <button
                  className={`${styles.btn} ${styles.btnDanger}`}
                  onClick={() => handleDelete(r.id, r.title)}
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
