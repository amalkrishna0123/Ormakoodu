'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  HiOutlineXMark,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineInformationCircle,
  HiOutlineArrowDownTray,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineMapPin,
  HiOutlineCalendar,
  HiOutlineDocument,
  HiOutlinePhoto,
  HiOutlineFolder,
  HiOutlineTag,
} from 'react-icons/hi2';
import {
  MEMORY_CATEGORIES,
  type MemoryAlbum,
  type MemoryCategory,
  type MemoryDoc,
} from '@/lib/types';
import { formatDuration, formatFileSize } from '@/lib/mediaMetadata';

interface MemoryLightboxProps {
  items: MemoryDoc[];
  currentIndex: number | null;
  albums: MemoryAlbum[];
  isAdmin: boolean;
  initialShowInfo?: boolean;
  onClose: () => void;
  onNavigate: (newIndex: number) => void;
  onUpdateMemory: (
    memoryId: string,
    updates: Partial<Omit<MemoryDoc, 'id' | 'createdAt' | 'updatedAt'>>
  ) => Promise<void>;
  onDeleteMemory: (memory: MemoryDoc) => Promise<void>;
}

function formatCaptureDisplay(capturedAt: string): string {
  const dt = new Date(capturedAt);
  if (Number.isNaN(dt.getTime())) return capturedAt;
  return dt.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function MemoryLightbox({
  items,
  currentIndex,
  albums,
  isAdmin,
  initialShowInfo = false,
  onClose,
  onNavigate,
  onUpdateMemory,
  onDeleteMemory,
}: MemoryLightboxProps) {
  const [showInfo, setShowInfo] = useState(initialShowInfo);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [editTitle, setEditTitle] = useState('');
  const [editFileName, setEditFileName] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editCategory, setEditCategory] = useState<string>('Family');
  const [editAlbumId, setEditAlbumId] = useState<string>('');
  const [editLocation, setEditLocation] = useState<string>('');

  const touchStartX = useRef<number | null>(null);

  const memory =
    currentIndex !== null && currentIndex >= 0 && currentIndex < items.length
      ? items[currentIndex]
      : null;

  useEffect(() => {
    if (currentIndex !== null) {
      setShowInfo(initialShowInfo);
    }
  }, [currentIndex, initialShowInfo]);

  useEffect(() => {
    if (!memory) return;
    setEditing(false);
    setEditTitle(memory.title || '');
    setEditFileName(memory.fileName || '');
    setEditNote(memory.note || '');
    setEditCategory(memory.category || 'Others');
    setEditAlbumId(memory.albumId || '');
    setEditLocation(memory.location || '');
  }, [memory]);

  useEffect(() => {
    if (currentIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && currentIndex < items.length - 1) {
        onNavigate(currentIndex + 1);
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        onNavigate(currentIndex - 1);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentIndex, items.length, onClose, onNavigate]);

  if (!memory || currentIndex === null) return null;

  const mediaSrc = memory.mediaUrl || memory.imageUrl || '';
  const isVideo = memory.mediaType === 'video';
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < items.length - 1;

  const handleDownload = async () => {
    if (!mediaSrc) return;
    const downloadName =
      memory.fileName ||
      `${memory.title.replace(/[^a-z0-9-_]+/gi, '_')}.${(memory.fileFormat || 'jpg').toLowerCase()}`;
    try {
      const res = await fetch(mediaSrc);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      window.open(mediaSrc, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const alb = albums.find((a) => a.id === editAlbumId);
    await onUpdateMemory(memory.id, {
      title: editTitle.trim() || memory.title,
      fileName: editFileName.trim() || memory.fileName,
      note: editNote.trim(),
      category: editCategory as MemoryCategory,
      albumId: alb ? alb.id : '',
      albumName: alb ? alb.name : '',
      location: editLocation.trim() || undefined,
    });
    setSaving(false);
    setEditing(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    await onDeleteMemory(memory);
    setDeleting(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-zinc-950/95 text-white backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={memory.title}
    >
      {/* Top Toolbar */}
      <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white"
          >
            <HiOutlineXMark className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-white">
              {memory.title}
            </h2>
            <p className="truncate text-[11px] text-white/60">
              {currentIndex + 1} of {items.length}
              {memory.fileName ? ` · ${memory.fileName}` : ''}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {mediaSrc && (
            <button
              type="button"
              onClick={handleDownload}
              title="Download"
              aria-label="Download media"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white"
            >
              <HiOutlineArrowDownTray className="h-5 w-5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowInfo((v) => !v)}
            title="Info"
            aria-label="Toggle media information"
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
              showInfo
                ? 'bg-[#e91e8c] text-white'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <HiOutlineInformationCircle className="h-5 w-5" />
          </button>
          {isAdmin && (
            <>
              <button
                type="button"
                onClick={() => {
                  setShowInfo(true);
                  setEditing(true);
                }}
                title="Edit details"
                aria-label="Edit details"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white"
              >
                <HiOutlinePencilSquare className="h-5 w-5" />
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                title="Delete memory"
                aria-label="Delete memory"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-red-400 hover:bg-red-500/20 hover:text-red-300 disabled:opacity-40"
              >
                <HiOutlineTrash className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="relative flex min-h-0 flex-1 flex-col md:flex-row">
        {/* Media Viewport */}
        <div
          className="relative flex flex-1 items-center justify-center overflow-hidden p-4"
          onTouchStart={(e) => {
            if (e.touches.length === 1) touchStartX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchStartX.current;
            if (dx < -50 && hasNext) onNavigate(currentIndex + 1);
            if (dx > 50 && hasPrev) onNavigate(currentIndex - 1);
            touchStartX.current = null;
          }}
        >
          {hasPrev && (
            <button
              type="button"
              onClick={() => onNavigate(currentIndex - 1)}
              aria-label="Previous memory"
              className="absolute left-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
            >
              <HiOutlineChevronLeft className="h-5 w-5" />
            </button>
          )}

          {mediaSrc ? (
            isVideo ? (
              <video
                key={memory.id}
                src={mediaSrc}
                controls
                autoPlay
                playsInline
                className="max-h-full max-w-full rounded-lg shadow-2xl"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={memory.id}
                src={mediaSrc}
                alt={memory.title}
                className="max-h-full max-w-full rounded-lg object-contain shadow-2xl select-none"
              />
            )
          ) : (
            <div className="rounded-2xl border border-white/15 bg-white/5 px-6 py-8 text-center">
              <p className="text-sm font-medium text-white/80">{memory.title}</p>
              {memory.note && <p className="mt-2 text-xs text-white/60">{memory.note}</p>}
            </div>
          )}

          {hasNext && (
            <button
              type="button"
              onClick={() => onNavigate(currentIndex + 1)}
              aria-label="Next memory"
              className="absolute right-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
            >
              <HiOutlineChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Info / Edit Side Drawer */}
        {showInfo && (
          <aside className="max-h-[45vh] w-full shrink-0 overflow-y-auto border-t border-white/10 bg-zinc-900 p-5 md:max-h-none md:w-80 md:border-t-0 md:border-l">
            {editing && isAdmin ? (
              <form onSubmit={handleSaveEdit} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Edit Details</h3>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="text-xs text-white/60 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-white/60">Title</label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-white/15 bg-zinc-800 px-3 py-1.5 text-xs text-white focus:border-[#e91e8c] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-white/60">File Name</label>
                  <input
                    type="text"
                    value={editFileName}
                    onChange={(e) => setEditFileName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-white/15 bg-zinc-800 px-3 py-1.5 text-xs text-white focus:border-[#e91e8c] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-white/60">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-white/15 bg-zinc-800 px-3 py-1.5 text-xs text-white focus:border-[#e91e8c] focus:outline-none"
                  >
                    {MEMORY_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-white/60">Album</label>
                  <select
                    value={editAlbumId}
                    onChange={(e) => setEditAlbumId(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-white/15 bg-zinc-800 px-3 py-1.5 text-xs text-white focus:border-[#e91e8c] focus:outline-none"
                  >
                    <option value="">No Album</option>
                    {albums.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-white/60">
                    Location (Optional)
                  </label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-white/15 bg-zinc-800 px-3 py-1.5 text-xs text-white focus:border-[#e91e8c] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-white/60">Note</label>
                  <textarea
                    rows={3}
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-white/15 bg-zinc-800 px-3 py-1.5 text-xs text-white focus:border-[#e91e8c] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-lg bg-[#e91e8c] px-4 py-2 text-xs font-semibold text-white hover:bg-[#c0185a] disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">Information</h3>
                  {memory.note && (
                    <p className="mt-2 text-xs leading-relaxed text-white/80">{memory.note}</p>
                  )}
                </div>

                <dl className="space-y-3 border-t border-white/10 pt-3 text-xs">
                  {memory.fileName && (
                    <div className="flex items-start gap-2.5">
                      <HiOutlineDocument className="mt-0.5 h-4 w-4 shrink-0 text-white/50" />
                      <div className="min-w-0">
                        <dt className="text-[11px] text-white/50">File name</dt>
                        <dd className="break-all font-medium text-white">{memory.fileName}</dd>
                      </div>
                    </div>
                  )}

                  {(memory.fileFormat || memory.fileSize || (memory.width && memory.height)) && (
                    <div className="flex items-start gap-2.5">
                      <HiOutlinePhoto className="mt-0.5 h-4 w-4 shrink-0 text-white/50" />
                      <div>
                        <dt className="text-[11px] text-white/50">Details</dt>
                        <dd className="font-medium text-white">
                          {[
                            memory.fileFormat,
                            memory.width && memory.height
                              ? `${memory.width} × ${memory.height}`
                              : null,
                            memory.fileSize ? formatFileSize(memory.fileSize) : null,
                            memory.durationSeconds
                              ? formatDuration(memory.durationSeconds)
                              : null,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </dd>
                      </div>
                    </div>
                  )}

                  {memory.capturedAt && (
                    <div className="flex items-start gap-2.5">
                      <HiOutlineCalendar className="mt-0.5 h-4 w-4 shrink-0 text-white/50" />
                      <div>
                        <dt className="text-[11px] text-white/50">Date and time captured</dt>
                        <dd className="font-medium text-white">
                          {formatCaptureDisplay(memory.capturedAt)}
                        </dd>
                      </div>
                    </div>
                  )}

                  {memory.location && (
                    <div className="flex items-start gap-2.5">
                      <HiOutlineMapPin className="mt-0.5 h-4 w-4 shrink-0 text-white/50" />
                      <div>
                        <dt className="text-[11px] text-white/50">Location</dt>
                        <dd className="font-medium text-white">{memory.location}</dd>
                      </div>
                    </div>
                  )}

                  {memory.category && (
                    <div className="flex items-start gap-2.5">
                      <HiOutlineTag className="mt-0.5 h-4 w-4 shrink-0 text-white/50" />
                      <div>
                        <dt className="text-[11px] text-white/50">Category</dt>
                        <dd className="font-medium text-white">{memory.category}</dd>
                      </div>
                    </div>
                  )}

                  {memory.albumName && (
                    <div className="flex items-start gap-2.5">
                      <HiOutlineFolder className="mt-0.5 h-4 w-4 shrink-0 text-white/50" />
                      <div>
                        <dt className="text-[11px] text-white/50">Album</dt>
                        <dd className="font-medium text-white">{memory.albumName}</dd>
                      </div>
                    </div>
                  )}
                </dl>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}

