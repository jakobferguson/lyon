import { useRef, useState } from 'react';
import styles from './PhotoUpload.module.css';

const MAX_PHOTOS = 15;
const MAX_SIZE_MB = 10;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/heic'];

interface PhotoPreview {
  id: string;
  name: string;
  url: string;
  sizeKb: number;
}

export function PhotoUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos]   = useState<PhotoPreview[]>([]);
  const [errors, setErrors]   = useState<string[]>([]);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const newErrors: string[] = [];
    const newPhotos: PhotoPreview[] = [];

    Array.from(files).forEach((file) => {
      if (!ACCEPTED.includes(file.type)) {
        newErrors.push(`${file.name}: unsupported format (JPEG, PNG, HEIC only).`);
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        newErrors.push(`${file.name}: exceeds 10 MB limit.`);
        return;
      }
      if (photos.length + newPhotos.length >= MAX_PHOTOS) {
        newErrors.push('Maximum 15 photos per incident reached.');
        return;
      }
      newPhotos.push({
        id: `${Date.now()}-${Math.random()}`,
        name: file.name,
        url: URL.createObjectURL(file),
        sizeKb: Math.round(file.size / 1024),
      });
    });

    setErrors(newErrors);
    setPhotos((prev) => [...prev, ...newPhotos].slice(0, MAX_PHOTOS));
  }

  function remove(id: string) {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }

  const remaining = MAX_PHOTOS - photos.length;

  return (
    <div className={styles.wrapper}>
      {/* Drop zone */}
      <div
        className={styles.dropZone}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add(styles.dragging); }}
        onDragLeave={(e) => e.currentTarget.classList.remove(styles.dragging)}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove(styles.dragging);
          handleFiles(e.dataTransfer.files);
        }}
        role="button"
        tabIndex={0}
        aria-label={`Upload photos. ${remaining} of ${MAX_PHOTOS} remaining.`}
      >
        <span className={styles.dropIcon} aria-hidden="true">📷</span>
        <p className={styles.dropText}>
          Drag photos here or <span className={styles.browse}>click to browse</span>
        </p>
        <p className={styles.dropHint}>JPEG, PNG, HEIC · 10 MB max · {remaining} remaining</p>
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.heic"
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <ul className={styles.errors} role="alert">
          {errors.map((err, i) => <li key={i}>{err}</li>)}
        </ul>
      )}

      {/* Previews */}
      {photos.length > 0 && (
        <div className={styles.grid} role="list" aria-label="Selected photos">
          {photos.map((photo) => (
            <div key={photo.id} className={styles.thumb} role="listitem">
              <img src={photo.url} alt={photo.name} className={styles.img} />
              <div className={styles.thumbMeta}>
                <span className={styles.thumbName}>{photo.name}</span>
                <span className={styles.thumbSize}>{photo.sizeKb} KB</span>
              </div>
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => remove(photo.id)}
                aria-label={`Remove ${photo.name}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
