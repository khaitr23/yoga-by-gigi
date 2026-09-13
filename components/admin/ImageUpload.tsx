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

  async function compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
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
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = reject;
      img.src = objectUrl;
    });
  }

  async function handleFile(file: File) {
    setProgress("reading file…");
    try {
      const base64 = await compressImage(file);
      setPreview(base64);
      setProgress("uploading…");
      const res = await fetch("/api/admin/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64, fileName: file.name, contentType: "image/jpeg" }),
      });
      const text = await res.text();
      let data: any = {};
      try { data = JSON.parse(text); } catch {
        throw new Error(
          text.toLowerCase().includes("entity too large")
            ? "Image is too large even after compression. Please use a smaller image."
            : text || "Upload failed"
        );
      }
      if (!res.ok) throw new Error(data.error ?? "upload failed");
      setProgress("");
      onUploaded(data.id, data.url);
    } catch (err: any) {
      setProgress("error: " + err.message);
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
