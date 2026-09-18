import { useEffect, useState, FormEvent } from "react";
import type { GetServerSideProps } from "next";
import { requireAdminSession } from "../../lib/admin/auth";
import AdminLayout from "../../components/admin/AdminLayout";
import ImageUpload from "../../components/admin/ImageUpload";
import styles from "../../styles/admin.module.css";
import { NAV_ITEMS, MAX_NAV_LABEL, NavLabels } from "../../lib/siteSettings";

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
  const [navLabels, setNavLabels] = useState<NavLabels>({});

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "could not load settings");
      setSiteName(data.siteName ?? "");
      setLogoUrl(data.logoUrl ?? null);
      setNavLabels(data.navLabels ?? {});
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
          navLabels,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "save failed");
      setSiteName(data.siteName ?? siteName);
      setLogoUrl(data.logoUrl ?? newLogoUrl ?? logoUrl);
      setNavLabels(data.navLabels ?? navLabels);
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
                <label className={styles.label}>browser tab icon</label>
                <ImageUpload
                  currentUrl={newLogoUrl || logoUrl}
                  preserveTransparency
                  onUploaded={(id, url) => { setNewLogoId(id); setNewLogoUrl(url); }}
                />
                <span className={styles.hint}>
                  click the preview to upload a new icon · this is the small picture
                  on the browser tab · the header itself shows the website name as
                  text, not a picture · a square PNG with a transparent background
                  works best
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

              {/* Navigation tab names */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>navigation tabs</label>
                <span className={styles.hint} style={{ marginBottom: "0.6rem" }}>
                  rename the tabs in the menu · leave a box empty to go back to its
                  original name · the page each tab opens doesn&apos;t change
                </span>
                {NAV_ITEMS.map(({ key, href, label }) => (
                  <div key={key} className={styles.fieldRow} style={{ alignItems: "center" }}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label} htmlFor={`nav-${key}`}>
                        {label}
                      </label>
                      <input
                        id={`nav-${key}`}
                        className={styles.input}
                        value={navLabels[key] ?? ""}
                        placeholder={label}
                        maxLength={MAX_NAV_LABEL}
                        onChange={(e) =>
                          setNavLabels((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                      />
                      <span className={styles.hint}>opens {href === "#" ? "nothing yet" : href}</span>
                    </div>
                  </div>
                ))}
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
