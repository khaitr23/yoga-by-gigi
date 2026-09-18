import { useEffect, useState, FormEvent } from "react";
import type { GetServerSideProps } from "next";
import { requireAdminSession } from "../../lib/admin/auth";
import AdminLayout from "../../components/admin/AdminLayout";
import ImageUpload from "../../components/admin/ImageUpload";
import styles from "../../styles/admin.module.css";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const redirect = await requireAdminSession(ctx);
  if (redirect) return redirect;
  return { props: {} };
};

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const [siteName, setSiteName] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [newLogoId, setNewLogoId] = useState("");
  const [newLogoUrl, setNewLogoUrl] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "could not load settings");
      setSiteName(data.siteName ?? "");
      setLogoUrl(data.logoUrl ?? null);
    } catch (err: any) {
      setAlert({ type: "error", msg: err.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!siteName.trim()) {
      setAlert({ type: "error", msg: "site name cannot be empty" });
      return;
    }
    setSaving(true);
    setAlert(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteName,
          logoAssetId: newLogoId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "save failed");
      setSiteName(data.siteName ?? siteName);
      setLogoUrl(data.logoUrl ?? newLogoUrl ?? logoUrl);
      setNewLogoId("");
      setNewLogoUrl("");
      setAlert({ type: "success", msg: "Saved and published. The site may take a moment to update." });
    } catch (err: any) {
      setAlert({ type: "error", msg: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>site settings</h1>
        <span className={styles.pageSubtitle}>name and logo · used across the whole site</span>
      </div>

      {alert && (
        <div className={`${styles.alert} ${alert.type === "success" ? styles.alertSuccess : styles.alertError}`}>
          {alert.msg}
        </div>
      )}

      {loading ? (
        <p className={styles.listItemMeta}>loading…</p>
      ) : (
        <div className={styles.sectionCard}>
          <div className={styles.sectionCardBody}>
            <form className={styles.form} onSubmit={handleSave}>
              {/* Logo */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>logo</label>
                <ImageUpload
                  currentUrl={newLogoUrl || logoUrl}
                  preserveTransparency
                  onUploaded={(id, url) => { setNewLogoId(id); setNewLogoUrl(url); }}
                />
                <span className={styles.hint}>
                  click the preview to upload a new logo · appears in the header and as the
                  browser tab icon · a square PNG with a transparent background works best
                </span>
              </div>

              {/* Site name */}
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="site-name">website name</label>
                <input
                  id="site-name"
                  className={styles.input}
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  maxLength={60}
                  placeholder="yoga by gigi"
                />
                <span className={styles.hint}>
                  shown in the footer, the mobile menu and the browser tab · it is written
                  exactly as you type it, so lowercase stays lowercase
                </span>
              </div>

              <div>
                <button
                  type="submit"
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  disabled={saving}
                >
                  {saving ? "saving…" : "save & publish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
