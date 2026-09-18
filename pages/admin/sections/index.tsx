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

interface ExtraImage { id: string; url: string }

interface Section {
  id: string;
  sectionType: string;
  sectionHeader: string;
  sectionDescription: string;
  ctaButtonText: string;
  ctaButtonLink: string;
  isTextAboveImage: boolean;
  imagePosition: string;
  coverImageId: string | null;
  coverImageUrl: string | null;
  additionalImages: ExtraImage[];
  published: boolean;
}

interface SectionState extends Section {
  open: boolean;
  saving: boolean;
  saved: boolean;
  error: string;
  busy: boolean;
  _header: string;
  _description: string;
  _ctaText: string;
  _ctaLink: string;
  _assetId: string;
  _assetUrl: string;
  _extras: ExtraImage[];
  _imagePosition: string;
}

const IMAGE_POSITION_OPTIONS = [
  { value: "auto", label: "auto — alternate left / right" },
  { value: "left", label: "left of the text" },
  { value: "right", label: "right of the text" },
  { value: "above", label: "above the text" },
  { value: "below", label: "below the text" },
];

const SECTION_TYPE_OPTIONS = [
  { value: "large-title-content-section", label: "Large title (hero-style)" },
  { value: "medium-title-content-section", label: "Medium title" },
  { value: "small-title-content-section", label: "Small title" },
  { value: "break", label: "Break (chapter divider)" },
];

export default function AdminSectionsPage() {
  const [sections, setSections] = useState<SectionState[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalAlert, setGlobalAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [adding, setAdding] = useState(false);
  const [newType, setNewType] = useState(SECTION_TYPE_OPTIONS[0].value);
  const [newHeader, setNewHeader] = useState("");
  const [creating, setCreating] = useState(false);

  function toState(s: Section): SectionState {
    return {
      ...s,
      additionalImages: s.additionalImages ?? [],
      open: false,
      saving: false,
      saved: false,
      error: "",
      busy: false,
      _header: s.sectionHeader,
      _description: s.sectionDescription,
      _ctaText: s.ctaButtonText,
      _ctaLink: s.ctaButtonLink,
      _assetId: "",
      _assetUrl: "",
      _extras: s.additionalImages ?? [],
      _imagePosition: s.imagePosition || "auto",
    };
  }

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/sections");
    const data = await res.json();
    setSections((data.sections ?? []).map(toState));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function flash(type: "success" | "error", msg: string) {
    setGlobalAlert({ type, msg });
    setTimeout(() => setGlobalAlert(null), 3500);
  }

  async function handleCreate() {
    if (creating) return;
    setCreating(true);
    try {
      const res = await fetch("/api/admin/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionType: newType, sectionHeader: newHeader }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "create failed");
      flash("success", `New "${newHeader || newType}" section added.`);
      setAdding(false);
      setNewHeader("");
      await load();
    } catch (err: any) {
      flash("error", err.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(section: SectionState) {
    if (!confirm(`Permanently delete "${section.sectionHeader || section.sectionType}"? This cannot be undone.`)) return;
    update(section.id, { busy: true, error: "" });
    try {
      const res = await fetch(`/api/admin/sections/${section.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "delete failed");
      setSections((prev) => prev.filter((s) => s.id !== section.id));
      flash("success", `"${section.sectionHeader || section.sectionType}" deleted.`);
    } catch (err: any) {
      update(section.id, { busy: false, error: err.message });
    }
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;

    // Optimistic reorder — swap immediately in local state, then persist.
    const reordered = [...sections];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setSections(reordered);

    try {
      const res = await fetch("/api/admin/sections/order", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: reordered.map((s) => s.id) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "reorder failed");
      flash("success", "Order updated.");
    } catch (err: any) {
      flash("error", err.message);
      // Roll back on failure
      await load();
    }
  }

  async function handleToggleVisibility(section: SectionState) {
    const nextVisible = !section.published;
    update(section.id, { busy: true, error: "" });
    try {
      const res = await fetch(`/api/admin/sections/${section.id}/visibility`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visible: nextVisible }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "toggle failed");
      update(section.id, { busy: false, published: nextVisible });
      flash("success", nextVisible ? "Section is now visible on the site." : "Section hidden from the site.");
    } catch (err: any) {
      update(section.id, { busy: false, error: err.message });
    }
  }

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
          additionalImageIds: section._extras.map((e) => e.id),
          imagePosition: section._imagePosition,
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
        additionalImages: section._extras,
        imagePosition: section._imagePosition,
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

      {/* Add section panel */}
      <div className={styles.sectionCard} style={{ marginBottom: "1.25rem" }}>
        {!adding ? (
          <div className={styles.sectionCardHeader} onClick={() => setAdding(true)}>
            <span className={styles.sectionCardIndex}>+</span>
            <div className={styles.sectionCardMeta}>
              <span className={styles.sectionCardType}>add new</span>
              <span className={styles.sectionCardTitle}>add a section</span>
            </div>
          </div>
        ) : (
          <div className={styles.sectionCardBody}>
            <div className={styles.fieldRow}>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="new-type">type</label>
                <select
                  id="new-type"
                  className={styles.select}
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                >
                  {SECTION_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="new-header">header (optional)</label>
                <input
                  id="new-header"
                  className={styles.input}
                  value={newHeader}
                  onChange={(e) => setNewHeader(e.target.value)}
                  placeholder="e.g. Workshops & Events"
                />
              </div>
            </div>
            <span className={styles.hint}>New sections are appended to the end. Edit details after creating.</span>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={handleCreate}
                disabled={creating}
              >
                {creating ? "creating…" : "create section"}
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={() => { setAdding(false); setNewHeader(""); }}
                disabled={creating}
              >
                cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {sections.map((section, i) => (
        <div
          key={section.id}
          className={styles.sectionCard}
          style={!section.published ? { opacity: 0.55 } : undefined}
        >
          {/* ── Accordion header ── */}
          <div className={styles.sectionCardHeader} onClick={() => toggle(section.id)}>
            <span className={styles.sectionCardIndex}>{String(i + 1).padStart(2, "0")}</span>
            <div className={styles.sectionCardMeta}>
              <span className={styles.sectionCardType}>
                {shortType(section.sectionType) || "section"}
              </span>
              <span className={styles.sectionCardTitle}>
                {section.sectionHeader || <em style={{ opacity: 0.4 }}>untitled</em>}
                {!section.published && (
                  <span style={{ marginLeft: "0.6rem", fontSize: "0.7rem", letterSpacing: "0.12em", color: "#a55", textTransform: "uppercase" }}>
                    · hidden
                  </span>
                )}
              </span>
            </div>
            <div
              style={{ display: "flex", gap: "0.25rem", marginRight: "0.5rem" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className={styles.btn}
                style={{ padding: "0.2rem 0.55rem", fontSize: "0.9rem" }}
                onClick={() => handleMove(i, -1)}
                disabled={i === 0}
                aria-label="move up"
                title="move up"
              >
                ↑
              </button>
              <button
                type="button"
                className={styles.btn}
                style={{ padding: "0.2rem 0.55rem", fontSize: "0.9rem" }}
                onClick={() => handleMove(i, 1)}
                disabled={i === sections.length - 1}
                aria-label="move down"
                title="move down"
              >
                ↓
              </button>
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

                {/* Image position */}
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor={`imgpos-${section.id}`}>
                    image position
                  </label>
                  <select
                    id={`imgpos-${section.id}`}
                    className={styles.select}
                    value={section._imagePosition}
                    onChange={(e) => update(section.id, { _imagePosition: e.target.value })}
                  >
                    {IMAGE_POSITION_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <span className={styles.hint}>
                    where the image sits next to the text · auto keeps the left/right
                    rhythm with the sections around it
                  </span>
                </div>

                {/* Additional images */}
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>additional images</label>
                  {section._extras.length > 0 && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                        gap: "0.75rem",
                        marginBottom: "0.75rem",
                      }}
                    >
                      {section._extras.map((img, idx) => (
                        <div
                          key={img.id}
                          style={{ position: "relative", aspectRatio: "4 / 3", overflow: "hidden", background: "rgba(115,64,35,0.05)", border: "1px solid rgba(115,64,35,0.15)" }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`${img.url}?fm=jpg&fl=progressive&w=400&q=75`}
                            alt=""
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              update(section.id, {
                                _extras: section._extras.filter((_, i) => i !== idx),
                              })
                            }
                            title="remove"
                            aria-label="remove"
                            style={{
                              position: "absolute",
                              top: 4,
                              right: 4,
                              background: "rgba(255,255,255,0.92)",
                              border: "1px solid rgba(115,64,35,0.35)",
                              color: "#a33",
                              width: 24,
                              height: 24,
                              borderRadius: "50%",
                              cursor: "pointer",
                              fontSize: "14px",
                              lineHeight: 1,
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <ImageUpload
                    currentUrl={null}
                    onUploaded={(id, url) =>
                      update(section.id, {
                        _extras: [...section._extras, { id, url }],
                      })
                    }
                  />
                  <span className={styles.hint}>upload additional images to stack below the cover on the site</span>
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

                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <button
                    type="submit"
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    disabled={section.saving || section.busy}
                  >
                    {section.saving ? "saving…" : "save & publish"}
                  </button>
                  <button
                    type="button"
                    className={`${styles.btn} ${styles.btnSecondary}`}
                    onClick={() => handleToggleVisibility(section)}
                    disabled={section.busy || section.saving}
                  >
                    {section.busy ? "…" : section.published ? "hide from site" : "show on site"}
                  </button>
                  <button
                    type="button"
                    className={`${styles.btn} ${styles.btnSecondary}`}
                    onClick={() => handleDelete(section)}
                    disabled={section.busy || section.saving}
                    style={{ marginLeft: "auto", color: "#a33", borderColor: "#a33" }}
                  >
                    delete permanently
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
