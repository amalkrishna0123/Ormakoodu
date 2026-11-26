'use client';

import React, { useEffect, useState } from 'react';
import {
  HiOutlineXMark,
  HiOutlineCloudArrowUp,
  HiOutlineFilm,
  HiOutlinePhoto,
  HiOutlineMapPin,
  HiOutlineCalendar,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
} from 'react-icons/hi2';
import {
  MEMORY_CATEGORIES,
  type EventVisibility,
  type MemoryAlbum,
  type MemoryCategory,
} from '@/lib/types';
import {
  extractMediaMetadata,
  formatDuration,
  formatFileSize,
  type ExtractedMediaMetadata,
} from '@/lib/mediaMetadata';
import { uploadMediaToCloudinary, validateMediaFile } from '@/lib/cloudinaryUpload';
import { saveMemory } from '@/lib/firestoreService';

interface QueuedFile {
  id: string;
  file: File;
  previewUrl: string;
  title: string;
  metadata: ExtractedMediaMetadata | null;
  error?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
}

interface MemoryUploadModalProps {
  open: boolean;
  albums: MemoryAlbum[];
  defaultAlbumId?: string;
  onClose: () => void;
  onCreateAlbum: (name: string) => Promise<MemoryAlbum | null>;
  onUploadComplete: () => void;
}

function formatReadableCaptureDate(isoLike: string): string {
  const dt = new Date(isoLike);
  if (Number.isNaN(dt.getTime())) return isoLike;
  return dt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function MemoryUploadModal({
  open,
  albums,
  defaultAlbumId = '',
  onClose,
  onCreateAlbum,
  onUploadComplete,
}: MemoryUploadModalProps) {
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [category, setCategory] = useState<MemoryCategory>('Family');
  const [albumId, setAlbumId] = useState<string>(defaultAlbumId);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [showNewAlbumInput, setShowNewAlbumInput] = useState(false);
  const [locationOverride, setLocationOverride] = useState('');
  const [note, setNote] = useState('');
  const [visibility, setVisibility] = useState<EventVisibility>('public');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setAlbumId(defaultAlbumId);
  }, [defaultAlbumId]);

  useEffect(() => {
    if (!open) {
      queue.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      setQueue([]);
      setUploading(false);
      setNewAlbumName('');
      setShowNewAlbumInput(false);
      setLocationOverride('');
      setNote('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const addFiles = async (fileList: FileList | File[]) => {
    const incoming = Array.from(fileList);
    if (incoming.length === 0) return;

    const newItems: QueuedFile[] = incoming.map((file) => {
      const validationErr = validateMediaFile(file);
      const baseTitle = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim() || file.name;
      return {
        id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        title: baseTitle,
        metadata: null,
        error: validationErr || undefined,
        progress: 0,
        status: validationErr ? 'error' : 'pending',
      };
    });

    setQueue((prev) => [...prev, ...newItems]);

    for (const item of newItems) {
      if (item.error) continue;
      const meta = await extractMediaMetadata(item.file);
      setQueue((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, metadata: meta } : q))
      );
    }
  };

  const handleRemoveItem = (id: string) => {
    setQueue((prev) => {
      const target = prev.find((q) => q.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((q) => q.id !== id);
    });
  };

  const handleCreateInlineAlbum = async () => {
    const trimmed = newAlbumName.trim();
    if (!trimmed) return;
    const created = await onCreateAlbum(trimmed);
    if (created) {
      setAlbumId(created.id);
      setNewAlbumName('');
      setShowNewAlbumInput(false);
    }
  };

  const handleStartUpload = async () => {
    const eligible = queue.filter((q) => q.status === 'pending');
    if (eligible.length === 0) return;

    setUploading(true);
    const selectedAlbum = albums.find((a) => a.id === albumId);

    for (const item of eligible) {
      setQueue((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, status: 'uploading', progress: 0 } : q))
      );

      try {
        const meta = item.metadata ?? (await extractMediaMetadata(item.file));
        const uploaded = await uploadMediaToCloudinary(
          item.file,
          'ormakoodu/memories',
          (pct) => {
            setQueue((prev) =>
              prev.map((q) => (q.id === item.id ? { ...q, progress: pct } : q))
            );
          }
        );

        const capturedDate = meta.capturedAt ? meta.capturedAt.slice(0, 10) : undefined;
        const dateLabel = meta.capturedAt
          ? formatReadableCaptureDate(meta.capturedAt)
          : new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });

        const finalLocation = locationOverride.trim() || meta.location || undefined;

        await saveMemory({
          title: item.title.trim() || meta.fileName,
          dateLabel,
          eventDate: capturedDate,
          note: note.trim(),
          imageUrl: uploaded.resourceType === 'image' ? uploaded.secureUrl : undefined,
          imagePublicId: uploaded.resourceType === 'image' ? uploaded.publicId : undefined,
          mediaUrl: uploaded.secureUrl,
          mediaType: uploaded.resourceType,
          publicId: uploaded.publicId,
          category,
          albumId: selectedAlbum?.id,
          albumName: selectedAlbum?.name,
          fileName: meta.fileName,
          fileSize: uploaded.bytes || meta.fileSize,
          fileFormat: uploaded.format || meta.fileFormat,
          width: uploaded.width || meta.width,
          height: uploaded.height || meta.height,
          durationSeconds: uploaded.duration ?? meta.durationSeconds,
          location: finalLocation,
          latitude: locationOverride.trim() ? undefined : meta.latitude,
          longitude: locationOverride.trim() ? undefined : meta.longitude,
          capturedAt: meta.capturedAt,
          visibility,
        });

        setQueue((prev) =>
          prev.map((q) => (q.id === item.id ? { ...q, status: 'done', progress: 100 } : q))
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Upload failed';
        setQueue((prev) =>
          prev.map((q) => (q.id === item.id ? { ...q, status: 'error', error: msg } : q))
        );
      }
    }

    setUploading(false);
    onUploadComplete();
  };

  const pendingCount = queue.filter((q) => q.status === 'pending').length;
  const doneCount = queue.filter((q) => q.status === 'done').length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-xs sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Upload photos and videos"
      onClick={() => !uploading && onClose()}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-zinc-200 bg-white shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-zinc-950">Upload Memories</h2>
            <p className="text-xs text-zinc-500">
              Select multiple photos or videos. Metadata is extracted automatically.
            </p>
          </div>
          <button
            type="button"
            disabled={uploading}
            onClick={onClose}
            aria-label="Close upload modal"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-40"
          >
            <HiOutlineXMark className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {/* Dropzone */}
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
            }}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
              isDragging
                ? 'border-[#e91e8c] bg-[#fff5fa]'
                : 'border-zinc-200 bg-[#fcfbfa] hover:border-zinc-300'
            }`}
          >
            <HiOutlineCloudArrowUp className="h-8 w-8 text-[#e91e8c]" />
            <p className="mt-2 text-sm font-medium text-zinc-900">
              Drop photos or videos here, or <span className="text-[#c0185a] underline">browse</span>
            </p>
            <p className="mt-0.5 text-[11px] text-zinc-500">
              JPG, PNG, WebP, AVIF (max 5 MB) · MP4, MOV, WebM (max 100 MB)
            </p>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/avif,image/heic,video/mp4,video/quicktime,video/webm,video/x-m4v"
              onChange={(e) => {
                if (e.target.files) addFiles(e.target.files);
                e.target.value = '';
              }}
              className="hidden"
            />
          </label>

          {/* Organization Fields */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MemoryCategory)}
                disabled={uploading}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-[#e91e8c] focus:outline-none"
              >
                {MEMORY_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                  Album (Optional)
                </label>
                <button
                  type="button"
                  onClick={() => setShowNewAlbumInput((v) => !v)}
                  className="text-[11px] font-semibold text-[#c0185a] hover:underline"
                >
                  {showNewAlbumInput ? 'Cancel' : '+ New Album'}
                </button>
              </div>
              {showNewAlbumInput ? (
                <div className="mt-1 flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Album name"
                    value={newAlbumName}
                    onChange={(e) => setNewAlbumName(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:border-[#e91e8c] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCreateInlineAlbum}
                    className="shrink-0 rounded-xl bg-zinc-950 px-3 py-2 text-xs font-semibold text-white"
                  >
                    Add
                  </button>
                </div>
              ) : (
                <select
                  value={albumId}
                  onChange={(e) => setAlbumId(e.target.value)}
                  disabled={uploading}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-[#e91e8c] focus:outline-none"
                >
                  <option value="">No Album</option>
                  {albums.map((alb) => (
                    <option key={alb.id} value={alb.id}>
                      {alb.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                Location (Optional)
              </label>
              <input
                type="text"
                placeholder="Leave blank to use file GPS if present"
                value={locationOverride}
                onChange={(e) => setLocationOverride(e.target.value)}
                disabled={uploading}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-[#e91e8c] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                Visibility
              </label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as EventVisibility)}
                disabled={uploading}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-[#e91e8c] focus:outline-none"
              >
                <option value="public">Public (Visible to Family)</option>
                <option value="private">Private (Admin Only)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
              Note / Caption (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Add a shared story or note for these memories…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={uploading}
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-[#e91e8c] focus:outline-none"
            />
          </div>

          {/* Queued Files List */}
          {queue.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-800">
                  Selected Files ({queue.length})
                </span>
                {doneCount > 0 && (
                  <span className="text-xs font-medium text-emerald-700">
                    {doneCount} uploaded
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {queue.map((item) => {
                  const isVideo = item.file.type.startsWith('video/');
                  const meta = item.metadata;
                  return (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 rounded-xl border border-zinc-200/80 bg-[#fcfbfa] p-2.5"
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-200">
                        {isVideo ? (
                          <video
                            src={item.previewUrl}
                            className="h-full w-full object-cover"
                            muted
                          />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.previewUrl}
                            alt={item.title}
                            className="h-full w-full object-cover"
                          />
                        )}
                        <span className="absolute right-1 bottom-1 rounded bg-black/65 p-0.5 text-white">
                          {isVideo ? (
                            <HiOutlineFilm className="h-3 w-3" />
                          ) : (
                            <HiOutlinePhoto className="h-3 w-3" />
                          )}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <input
                          type="text"
                          value={item.title}
                          disabled={uploading || item.status === 'done'}
                          onChange={(e) => {
                            const val = e.target.value;
                            setQueue((prev) =>
                              prev.map((q) => (q.id === item.id ? { ...q, title: val } : q))
                            );
                          }}
                          className="w-full truncate rounded-lg border border-transparent bg-transparent px-1 py-0.5 text-xs font-semibold text-zinc-900 focus:border-zinc-300 focus:bg-white focus:outline-none"
                        />

                        <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-zinc-500">
                          <span>{meta?.fileFormat || item.file.type.split('/')[1]?.toUpperCase()}</span>
                          <span>{formatFileSize(item.file.size)}</span>
                          {meta?.width && meta?.height && (
                            <span>
                              {meta.width} × {meta.height}
                            </span>
                          )}
                          {meta?.durationSeconds && (
                            <span>{formatDuration(meta.durationSeconds)}</span>
                          )}
                          {meta?.capturedAt && (
                            <span className="inline-flex items-center gap-0.5 text-zinc-600">
                              <HiOutlineCalendar className="h-3 w-3" />
                              {meta.capturedAt.replace('T', ' ')}
                            </span>
                          )}
                          {meta?.location && (
                            <span className="inline-flex items-center gap-0.5 text-zinc-600">
                              <HiOutlineMapPin className="h-3 w-3" />
                              {meta.location}
                            </span>
                          )}
                        </div>

                        {item.status === 'uploading' && (
                          <div className="mt-2">
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200">
                              <div
                                className="h-full rounded-full bg-[#e91e8c] transition-all duration-200"
                                style={{ width: `${item.progress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {item.error && (
                          <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-red-600">
                            <HiOutlineExclamationCircle className="h-3.5 w-3.5 shrink-0" />
                            {item.error}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0">
                        {item.status === 'done' ? (
                          <HiOutlineCheckCircle className="h-5 w-5 text-emerald-600" />
                        ) : (
                          !uploading && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              aria-label="Remove file"
                              className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-200/60 hover:text-zinc-700"
                            >
                              <HiOutlineXMark className="h-4 w-4" />
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-100 bg-[#fcfbfa] px-5 py-3.5">
          <button
            type="button"
            disabled={uploading}
            onClick={onClose}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-40"
          >
            {doneCount > 0 && pendingCount === 0 ? 'Done' : 'Cancel'}
          </button>
          <button
            type="button"
            disabled={uploading || pendingCount === 0}
            onClick={handleStartUpload}
            className="rounded-xl bg-[#e91e8c] px-5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#c0185a] disabled:opacity-50"
          >
            {uploading
              ? 'Uploading…'
              : `Upload ${pendingCount > 0 ? `(${pendingCount})` : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}

