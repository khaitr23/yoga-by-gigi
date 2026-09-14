import { useRef, useState } from "react";
import styles from "../../styles/admin.module.css";

interface Props {
  currentUrl?: string | null;
  onUploaded: (assetId: string, url: string) => void;
}

export default function ImageUpload({ currentUrl, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [progress, setProgress] = useState("");
  const [uploaded, setUploaded] = useState(false);

  async function compressImage(
    file: File
  ): Promise<{ base64: string; contentType: string }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        try {
          const MAX = 1800;
          let { width, height } = img;
          if (width > MAX || height > MAX) {
            if (width > height) { height = Math.round((height * MAX) / width); width = MAX; }
            else { width = Math.round((width * MAX) / height); height = MAX; }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
          resolve({ base64: canvas.toDataURL("image/jpeg", 0.82), contentType: "image/jpeg" });
        } catch (e: any) {
          reject(new Error(e?.message || "Image compression failed"));
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Browser could not decode this image (unsupported color profile or format)"));
      };
      img.src = objectUrl;
    });
  }

  function readAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  }

  async function handleFile(file: File) {
    setUploaded(false);
    // Use a short blob URL for the local preview — data URLs over a few MB
    // can fail to render inline in <img> in some browsers.
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setProgress("preparing image…");
    try {
      let base64: string;
      let contentType: string;
      let fileName = file.name;
      try {
        const compressed = await compressImage(file);
        base64 = compressed.base64;
        contentType = compressed.contentType;
      } catch (compressErr) {
        console.warn("compression failed, uploading raw file:", compressErr);
        base64 = await readAsDataUrl(file);
        contentType = file.type || "application/octet-stream";
      }
      setProgress("uploading to Contentful (may take up to 30s)…");
      const res = await fetch("/api/admin/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64, fileName, contentType }),
      });
      const text = await res.text();
      let data: any = {};
      try { data = JSON.parse(text); } catch {
        throw new Error(
          text.toLowerCase().includes("entity too large")
            ? "Image is too large. Please use a smaller image."
            : text.toLowerCase().includes("timeout") || text.includes("504")
              ? "Upload timed out. Please try again."
              : text || "Upload failed (empty response)"
        );
      }
      if (!res.ok) throw new Error(data.error || `upload failed (HTTP ${res.status})`);
      if (!data.id || !data.url) throw new Error("upload response missing id or url");
      // Switch to the real Contentful URL now that upload succeeded, then free the blob.
      setPreview(data.url);
      URL.revokeObjectURL(localPreview);
      setProgress("");
      setUploaded(true);
      onUploaded(data.id, data.url);
    } catch (err: any) {
      const msg = err?.message || (typeof err === "string" ? err : "Unknown upload error");
      console.error("[ImageUpload]", err);
      setProgress("error: " + msg);
    }
  }

  return (
    <div className={styles.imageUpload}>
      <div
        className={styles.imagePreview}
        onClick={() => inputRef.current?.click()}
        style={{ cursor: "pointer" }}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="preview" />
        ) : (
          <span className={styles.imagePlaceholder}>click to upload image</span>
        )}
      </div>
      {progress && <span className={styles.uploadProgress}>{progress}</span>}
      {uploaded && (
        <span className={styles.uploadProgress} style={{ color: "green" }}>
          ✓ uploaded — now click <strong>save &amp; publish</strong> to apply it to the page
        </span>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
