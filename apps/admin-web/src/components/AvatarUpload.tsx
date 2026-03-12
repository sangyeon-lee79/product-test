import { useRef, useState, useCallback } from 'react';
import { api } from '../lib/api';
import {
  ALLOWED_UPLOAD_TYPES,
  compressImageFile,
  fileToDataUrl,
} from '../pages/guardian/guardianTypes';

const AVATAR_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const AVATAR_MAX_EDGE = 512;
const AVATAR_MAX_MB = 0.3;

interface AvatarUploadProps {
  currentUrl: string | null | undefined;
  fallbackLetter: string;
  size: number;
  storageType: 'user_avatar' | 'pet_avatar';
  onUploaded: (publicUrl: string) => void;
  disabled?: boolean;
  t: (key: string, fallback?: string) => string;
}

function uploadBinary(
  uploadUrl: string,
  file: File,
  onProgress: (ratio: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) onProgress(event.loaded / event.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) { onProgress(1); resolve(); return; }
      reject(new Error(xhr.statusText || 'upload_failed'));
    };
    xhr.onerror = () => reject(new Error('upload_failed'));
    xhr.send(file);
  });
}

export default function AvatarUpload({
  currentUrl,
  fallbackLetter,
  size,
  storageType,
  onUploaded,
  disabled,
  t,
}: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const displayUrl = previewUrl || currentUrl;

  const handleClick = useCallback(() => {
    if (!disabled && !uploading) inputRef.current?.click();
  }, [disabled, uploading]);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (e.target) e.target.value = '';
      if (!file) return;

      // Validate type
      if (!ALLOWED_UPLOAD_TYPES.has(file.type)) {
        setError(t('avatar.upload.type_invalid', 'Only JPG/PNG/WEBP files are allowed.'));
        return;
      }
      // Validate size
      if (file.size > AVATAR_MAX_SIZE) {
        setError(t('avatar.upload.size_limit', 'File size must be 5MB or less.'));
        return;
      }

      setError('');
      setUploading(true);
      setProgress(0);

      try {
        // Compress
        const compressed = await compressImageFile(file, {
          maxEdge: AVATAR_MAX_EDGE,
          maxSizeMB: AVATAR_MAX_MB,
        });

        // Instant preview
        const preview = URL.createObjectURL(compressed);
        setPreviewUrl(preview);

        // Get presigned URL
        const presigned = await api.storage.presignedUrl({
          type: storageType,
          ext: 'jpg',
        });

        // Upload binary
        await uploadBinary(presigned.upload_url, compressed, setProgress);

        // Success
        onUploaded(presigned.public_url);
      } catch {
        // Fallback: use data URL if R2 unavailable
        try {
          const dataUrl = await fileToDataUrl(file);
          setPreviewUrl(dataUrl);
          onUploaded(dataUrl);
        } catch {
          setError(t('avatar.upload.failed', 'Failed to upload photo.'));
          setPreviewUrl(null);
        }
      } finally {
        setUploading(false);
      }
    },
    [storageType, onUploaded, t],
  );

  const fontSize = Math.max(12, Math.round(size * 0.35));

  return (
    <div className="pf-avatar-upload" onClick={handleClick} style={{ width: size, height: size }}>
      <div
        className="pf-avatar-upload-circle"
        style={{ width: size, height: size, fontSize }}
      >
        {displayUrl ? (
          <img src={displayUrl} alt="" className="pf-avatar-img" />
        ) : (
          fallbackLetter
        )}
      </div>

      {/* Hover overlay */}
      {!uploading && !disabled && (
        <div className="pf-avatar-upload-overlay">
          <span className="pf-avatar-upload-icon">&#128247;</span>
          <span>{t('avatar.upload.change', 'Change Photo')}</span>
        </div>
      )}

      {/* Upload progress */}
      {uploading && (
        <div className="pf-avatar-upload-progress">
          {Math.round(progress * 100)}%
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="pf-avatar-upload-error">{error}</div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  );
}
