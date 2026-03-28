import { useEffect, useState, FormEvent } from "react";
import type { GetServerSideProps } from "next";
import { requireAdminSession } from "../../../lib/admin/auth";
import AdminLayout from "../../../components/admin/AdminLayout";
import ImageUpload from "../../../components/admin/ImageUpload";
import styles from "../../../styles/admin.module.css";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const redirect = await requireAdminSession(ctx);
  if (redirect) return redirect;
  return { props: {} };
};

interface Section {
  id: string;
  sectionType: string;
  sectionHeader: string;
  sectionDescription: string;
  ctaButtonText: string;
  ctaButtonLink: string;
  isTextAboveImage: boolean;
  coverImageId: string | null;
  coverImageUrl: string | null;
}

interface SectionState extends Section {
  open: boolean;
  saving: boolean;
  saved: boolean;
  error: string;
  _header: string;
  _description: string;
  _ctaText: string;
  _ctaLink: string;
  _assetId: string;
  _assetUrl: string;
}

export default function AdminSectionsPage() {
  const [sections, setSections] = useState<SectionState[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalAlert, setGlobalAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/sections");
    const data = await res.json();
    setSections(
      (data.sections ?? []).map((s: Section) => ({
        ...s,
        open: false,
        saving: false,
        saved: false,
        error: "",
        _header: s.sectionHeader,
        _description: s.sectionDescription,
        _ctaText: s.ctaButtonText,
        _ctaLink: s.ctaButtonLink,
        _assetId: "",
        _assetUrl: "",
      }))
    );
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function toggle(id: string) {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, open: !s.open } : s))
    );
  }

  function update(id: string, patch: Partial<SectionState>) {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  async function handleSave(e: FormEvent, section: SectionState) {
    e.preventDefault();
    update(section.id, { saving: true, saved: false, error: "" });

    try {
      const res = await fetch(`/api/admin/sections/${section.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionHeader: section._header,
          sectionDescription: section._description,
          ctaButtonText: section._ctaText,
          ctaButtonLink: section._ctaLink,
          assetId: section._assetId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "save failed");
      update(section.id, {
        saving: false,
        saved: true,
        sectionHeader: section._header,
        sectionDescription: section._description,
        ctaButtonText: section._ctaText,
        ctaButtonLink: section._ctaLink,
        // If a new asset was uploaded, update the preview URL
        coverImageUrl: section._assetUrl || section.coverImageUrl,
      });
      setGlobalAlert({ type: "success", msg: `"${section._header || section.sectionType}" saved and published.` });
      setTimeout(() => setGlobalAlert(null), 3500);
    } catch (err: any) {
      update(section.id, { saving: false, error: err.message });
    }
  }

  // Convert "largeTitleContentSection" → "large title content section"
  function humanizeType(t: string) {
    return t
      .replace(/([A-Z])/g, " $1")
      .replace(/-/g, " ")
      .toLowerCase()
      .trim();
  }

  // Shorten to the first two meaningful words for the badge
  function shortType(t: string) {
    const words = humanizeType(t).split(" ").filter(Boolean);
    // e.g. "large title content section" → "large title"
    return words.slice(0, 2).join(" ");
  }

  return (
    <AdminLayout>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>homepage sections</h1>
        <span className={styles.pageSubtitle}>
          {sections.length > 0 ? `${sections.length} sections · in page order` : ""}
        </span>
      </div>

      {globalAlert && (
        <div className={`${styles.alert} ${globalAlert.type === "success" ? styles.alertSuccess : styles.alertError}`}>
          {globalAlert.msg}
        </div>
      )}

      {loading && <p className={styles.listItemMeta}>loading…</p>}

      {sections.map((section, i) => (
        <div key={section.id} className={styles.sectionCard}>
          {/* ── Accordion header ── */}
          <div className={styles.sectionCardHeader} onClick={() => toggle(section.id)}>
            <span className={styles.sectionCardIndex}>{String(i + 1).padStart(2, "0")}</span>
            <div className={styles.sectionCardMeta}>
              <span className={styles.sectionCardType}>
                {shortType(section.sectionType) || "section"}
              </span>
              <span className={styles.sectionCardTitle}>
                {section.sectionHeader || <em style={{ opacity: 0.4 }}>untitled</em>}
              </span>
            </div>
            <span className={`${styles.sectionCardChevron}${section.open ? " " + styles.open : ""}`}>
              ▾
            </span>
          </div>

          {/* ── Accordion body ── */}
          {section.open && (
            <div className={styles.sectionCardBody}>
              {section.error && (
                <div className={`${styles.alert} ${styles.alertError}`}>{section.error}</div>
              )}
              {section.saved && (
                <div className={`${styles.alert} ${styles.alertSuccess}`}>Saved and published.</div>
              )}

              <form className={styles.form} onSubmit={(e) => handleSave(e, section)}>
                {/* Cover image */}
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>cover image</label>
                  <ImageUpload
                    currentUrl={section._assetUrl || section.coverImageUrl || null}
                    onUploaded={(id, url) =>
                      update(section.id, { _assetId: id, _assetUrl: url })
                    }
                  />
                  <span className={styles.hint}>click the preview to replace the image</span>
                </div>

                {/* Header */}
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor={`header-${section.id}`}>
                    section header
                  </label>
                  <input
                    id={`header-${section.id}`}
                    className={styles.input}
                    value={section._header}
                    onChange={(e) => update(section.id, { _header: e.target.value })}
                  />
                </div>

                {/* Description */}
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor={`desc-${section.id}`}>
                    description
                  </label>
                  <textarea
                    id={`desc-${section.id}`}
                    className={styles.textarea}
                    rows={4}
                    value={section._description}
                    onChange={(e) => update(section.id, { _description: e.target.value })}
                  />
                </div>

                {/* CTA row */}
                <div className={styles.fieldRow}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor={`cta-text-${section.id}`}>
                      button text
                    </label>
                    <input
                      id={`cta-text-${section.id}`}
                      className={styles.input}
                      value={section._ctaText}
                      onChange={(e) => update(section.id, { _ctaText: e.target.value })}
                      placeholder="e.g. Learn more"
                    />
                    <span className={styles.hint}>leave blank to hide the button</span>
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor={`cta-link-${section.id}`}>
                      button link
                    </label>
                    <input
                      id={`cta-link-${section.id}`}
                      className={styles.input}
                      value={section._ctaLink}
                      onChange={(e) => update(section.id, { _ctaLink: e.target.value })}
                      placeholder="/retreats"
                    />
                    <span className={styles.hint}>use a path like /retreats or a full URL</span>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    disabled={section.saving}
                  >
                    {section.saving ? "saving…" : "save & publish"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      ))}
    </AdminLayout>
  );
}
