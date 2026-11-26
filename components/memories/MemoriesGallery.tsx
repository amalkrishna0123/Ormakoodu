'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import {
  HiOutlineMagnifyingGlass,
  HiOutlinePlus,
  HiOutlineCloudArrowUp,
  HiOutlineFolderPlus,
  HiOutlinePlay,
  HiOutlineFunnel,
  HiOutlineXMark,
  HiOutlineCheckCircle,
  HiOutlineTrash,
  HiOutlineFolderArrowDown,
  HiOutlinePhoto,
} from 'react-icons/hi2';
import { getFirebaseAuth } from '@/lib/firebase';
import {
  deleteMemory,
  isAuthorizedAdmin,
  saveMemoryAlbums,
  subscribeAllMemories,
  subscribeMemoryAlbums,
  subscribePublicMemories,
  updateMemoryFields,
} from '@/lib/firestoreService';
import { deleteImageFromCloudinary } from '@/lib/cloudinaryUpload';
import { formatDuration } from '@/lib/mediaMetadata';
import {
  MEMORY_CATEGORIES,
  type MemoryAlbum,
  type MemoryDoc,
} from '@/lib/types';
import MemoryUploadModal from './MemoryUploadModal';
import MemoryLightbox from './MemoryLightbox';

const MONTH_LABELS = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

function getMemoryIsoDate(mem: MemoryDoc): string {
  if (mem.capturedAt && /^\d{4}-\d{2}-\d{2}/.test(mem.capturedAt)) {
    return mem.capturedAt.slice(0, 10);
  }
  if (mem.eventDate && /^\d{4}-\d{2}-\d{2}/.test(mem.eventDate)) {
    return mem.eventDate.slice(0, 10);
  }
  const ts = mem.createdAt as { seconds?: number } | undefined;
  if (ts?.seconds) {
    const dt = new Date(ts.seconds * 1000);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return '';
}

function formatDateHeading(isoDate: string): string {
  if (!isoDate) return 'Memories';
  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y || !m || !d) return isoDate;
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

interface MemoriesGalleryProps {
  onCountChange?: (count: number) => void;
}

export default function MemoriesGallery({ onCountChange }: MemoriesGalleryProps) {
  const [memories, setMemories] = useState<MemoryDoc[]>([]);
  const [albums, setAlbums] = useState<MemoryAlbum[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaFilter, setMediaFilter] = useState<'all' | 'image' | 'video'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [albumFilter, setAlbumFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [exactDateFilter, setExactDateFilter] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  // Modals & Selection
  const [uploadOpen, setUploadOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [creatingAlbum, setCreatingAlbum] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');

  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [moveTargetAlbumId, setMoveTargetAlbumId] = useState<string>('');
  const [bulkBusy, setBulkBusy] = useState(false);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const ok = await isAuthorizedAdmin(user.uid, user.email);
        setIsAdmin(ok);
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    const unsubMemories = isAdmin
      ? subscribeAllMemories(
          (list) => {
            setMemories(list);
            setLoaded(true);
            onCountChange?.(list.length);
          },
          () => setLoaded(true)
        )
      : subscribePublicMemories(
          (list) => {
            setMemories(list);
            setLoaded(true);
            onCountChange?.(list.length);
          },
          () => setLoaded(true)
        );
    const unsubAlbums = subscribeMemoryAlbums(setAlbums);
    return () => {
      unsubMemories();
      unsubAlbums();
    };
  }, [isAdmin, onCountChange]);

  const availableYears = useMemo(() => {
    const set = new Set<string>();
    for (const m of memories) {
      const iso = getMemoryIsoDate(m);
      if (iso) set.add(iso.slice(0, 4));
    }
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [memories]);

  const availableLocations = useMemo(() => {
    const set = new Set<string>();
    for (const m of memories) {
      if (m.location) set.add(m.location);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [memories]);

  const filteredMemories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return memories.filter((mem) => {
      const type = mem.mediaType || 'image';
      if (mediaFilter !== 'all' && type !== mediaFilter) return false;
      if (categoryFilter !== 'all' && (mem.category || 'Others') !== categoryFilter) {
        return false;
      }
      if (albumFilter !== 'all') {
        if (albumFilter === 'unassigned') {
          if (mem.albumId) return false;
        } else if (mem.albumId !== albumFilter) {
          return false;
        }
      }
      if (locationFilter !== 'all' && mem.location !== locationFilter) return false;

      const iso = getMemoryIsoDate(mem);
      if (exactDateFilter && iso !== exactDateFilter) return false;
      if (yearFilter !== 'all' && iso.slice(0, 4) !== yearFilter) return false;
      if (monthFilter !== 'all' && iso.slice(5, 7) !== monthFilter) return false;

      if (q) {
        const hay = `${mem.fileName || ''} ${mem.title || ''} ${mem.note || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [
    memories,
    searchQuery,
    mediaFilter,
    categoryFilter,
    albumFilter,
    locationFilter,
    exactDateFilter,
    yearFilter,
    monthFilter,
  ]);

  const dateGroups = useMemo(() => {
    const map = new Map<string, MemoryDoc[]>();
    for (const mem of filteredMemories) {
      const iso = getMemoryIsoDate(mem) || 'undated';
      const arr = map.get(iso);
      if (arr) arr.push(mem);
      else map.set(iso, [mem]);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => {
        if (a === 'undated') return 1;
        if (b === 'undated') return -1;
        return b.localeCompare(a);
      })
      .map(([iso, items]) => ({
        iso,
        heading: iso === 'undated' ? 'Other Memories' : formatDateHeading(iso),
        items,
      }));
  }, [filteredMemories]);

  // Flat ordered list matching the visual date-grouped order for smooth lightbox navigation
  const flatOrderedMemories = useMemo(
    () => dateGroups.flatMap((g) => g.items),
    [dateGroups]
  );

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    mediaFilter !== 'all' ||
    categoryFilter !== 'all' ||
    albumFilter !== 'all' ||
    yearFilter !== 'all' ||
    monthFilter !== 'all' ||
    exactDateFilter !== '' ||
    locationFilter !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setMediaFilter('all');
    setCategoryFilter('all');
    setAlbumFilter('all');
    setYearFilter('all');
    setMonthFilter('all');
    setExactDateFilter('');
    setLocationFilter('all');
  };

  const handleCreateAlbum = async (name: string): Promise<MemoryAlbum | null> => {
    const trimmed = name.trim();
    if (!trimmed) return null;
    const id = `${trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`;
    const newAlb: MemoryAlbum = {
      id,
      name: trimmed,
      createdAt: new Date().toISOString(),
    };
    const next = [...albums, newAlb];
    await saveMemoryAlbums(next);
    return newAlb;
  };

  const handleCreateAlbumSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbumName.trim()) return;
    await handleCreateAlbum(newAlbumName);
    setNewAlbumName('');
    setCreatingAlbum(false);
  };

  const handleUpdateMemory = async (
    memoryId: string,
    updates: Partial<Omit<MemoryDoc, 'id' | 'createdAt' | 'updatedAt'>>
  ) => {
    await updateMemoryFields(memoryId, updates);
  };

  const handleDeleteMemory = async (mem: MemoryDoc) => {
    await deleteMemory(mem.id);
    const pubId = mem.publicId || mem.imagePublicId;
    if (pubId) {
      await deleteImageFromCloudinary(pubId, mem.mediaType || 'image').catch(() => {});
    }
    setLightboxIndex(null);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkMoveToAlbum = async () => {
    if (selectedIds.size === 0) return;
    setBulkBusy(true);
    const alb = albums.find((a) => a.id === moveTargetAlbumId);
    for (const id of selectedIds) {
      await updateMemoryFields(id, {
        albumId: alb ? alb.id : '',
        albumName: alb ? alb.name : '',
      });
    }
    setBulkBusy(false);
    setSelectedIds(new Set());
    setSelectMode(false);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setBulkBusy(true);
    for (const id of selectedIds) {
      const mem = memories.find((m) => m.id === id);
      if (mem) {
        await deleteMemory(mem.id);
        const pubId = mem.publicId || mem.imagePublicId;
        if (pubId) {
          await deleteImageFromCloudinary(pubId, mem.mediaType || 'image').catch(() => {});
        }
      }
    }
    setBulkBusy(false);
    setSelectedIds(new Set());
    setSelectMode(false);
  };

  return (
    <div className="space-y-5">
      {/* Top Action & Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200/80 bg-[#fcfbfa] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative min-w-[200px] flex-1">
            <HiOutlineMagnifyingGlass className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by file name, title, or note…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white py-2 pr-8 pl-9 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#e91e8c] focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute top-1/2 right-2.5 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
              >
                <HiOutlineXMark className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowMoreFilters((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                showMoreFilters || yearFilter !== 'all' || monthFilter !== 'all' || exactDateFilter || locationFilter !== 'all'
                  ? 'border-[#e91e8c] bg-[#fff0f7] text-[#c0185a]'
                  : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
              }`}
            >
              <HiOutlineFunnel className="h-3.5 w-3.5" />
              Filters
            </button>

            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setSelectMode((v) => !v);
                    setSelectedIds(new Set());
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                    selectMode
                      ? 'border-zinc-950 bg-zinc-950 text-white'
                      : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  <HiOutlineCheckCircle className="h-3.5 w-3.5" />
                  {selectMode ? 'Cancel Select' : 'Select'}
                </button>
                <button
                  type="button"
                  onClick={() => setCreatingAlbum((v) => !v)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                  <HiOutlineFolderPlus className="h-3.5 w-3.5" />
                  New Album
                </button>
                <button
                  type="button"
                  onClick={() => setUploadOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#e91e8c] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#c0185a]"
                >
                  <HiOutlineCloudArrowUp className="h-4 w-4" />
                  Upload
                </button>
              </>
            )}
          </div>
        </div>

        {/* Media Type + Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              ['all', 'All'],
              ['image', 'Photos'],
              ['video', 'Videos'],
            ] as const
          ).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => setMediaFilter(val)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                mediaFilter === val
                  ? 'bg-zinc-950 text-white'
                  : 'bg-white text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-100'
              }`}
            >
              {label}
            </button>
          ))}

          <span className="mx-1 h-4 w-px bg-zinc-200" aria-hidden="true" />

          <button
            type="button"
            onClick={() => setCategoryFilter('all')}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              categoryFilter === 'all'
                ? 'bg-[#e91e8c] text-white'
                : 'bg-white text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-100'
            }`}
          >
            All Categories
          </button>
          {MEMORY_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                categoryFilter === cat
                  ? 'bg-[#e91e8c] text-white'
                  : 'bg-white text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Expandable Date / Year / Month / Location Filters */}
        {showMoreFilters && (
          <div className="grid grid-cols-1 gap-2.5 border-t border-zinc-200/70 pt-3 sm:grid-cols-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                Year
              </label>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 focus:border-[#e91e8c] focus:outline-none"
              >
                <option value="all">All Years</option>
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                Month
              </label>
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 focus:border-[#e91e8c] focus:outline-none"
              >
                <option value="all">All Months</option>
                {MONTH_LABELS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                Specific Date
              </label>
              <input
                type="date"
                value={exactDateFilter}
                onChange={(e) => setExactDateFilter(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 focus:border-[#e91e8c] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                Location
              </label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 focus:border-[#e91e8c] focus:outline-none"
              >
                <option value="all">All Locations</option>
                {availableLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Inline New Album Form */}
        {creatingAlbum && isAdmin && (
          <form
            onSubmit={handleCreateAlbumSubmit}
            className="flex flex-wrap items-center gap-2 border-t border-zinc-200/70 pt-3"
          >
            <input
              type="text"
              required
              placeholder="New custom album name (e.g. Onam 2026)"
              value={newAlbumName}
              onChange={(e) => setNewAlbumName(e.target.value)}
              className="min-w-[200px] flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs focus:border-[#e91e8c] focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-xl bg-zinc-950 px-3.5 py-1.5 text-xs font-semibold text-white"
            >
              Create Album
            </button>
          </form>
        )}
      </div>

      {/* Custom Albums Strip */}
      {albums.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setAlbumFilter('all')}
            className={`shrink-0 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors ${
              albumFilter === 'all'
                ? 'border-zinc-950 bg-zinc-950 text-white'
                : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
            }`}
          >
            All Albums
          </button>
          {albums.map((alb) => {
            const count = memories.filter((m) => m.albumId === alb.id).length;
            return (
              <button
                key={alb.id}
                type="button"
                onClick={() => setAlbumFilter(alb.id)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors ${
                  albumFilter === alb.id
                    ? 'border-[#e91e8c] bg-[#fff0f7] text-[#c0185a]'
                    : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                }`}
              >
                <span>{alb.name}</span>
                <span className="rounded-full bg-black/5 px-1.5 py-0.5 text-[10px]">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Bulk Selection Bar */}
      {selectMode && isAdmin && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e91e8c]/30 bg-[#fff5fa] px-4 py-2.5">
          <span className="text-xs font-semibold text-[#c0185a]">
            {selectedIds.size} selected
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={moveTargetAlbumId}
              onChange={(e) => setMoveTargetAlbumId(e.target.value)}
              className="rounded-xl border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900"
            >
              <option value="">Remove from Album</option>
              {albums.map((a) => (
                <option key={a.id} value={a.id}>
                  Move to: {a.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={bulkBusy || selectedIds.size === 0}
              onClick={handleBulkMoveToAlbum}
              className="inline-flex items-center gap-1 rounded-xl bg-zinc-950 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
            >
              <HiOutlineFolderArrowDown className="h-3.5 w-3.5" />
              Move
            </button>
            <button
              type="button"
              disabled={bulkBusy || selectedIds.size === 0}
              onClick={handleBulkDelete}
              className="inline-flex items-center gap-1 rounded-xl bg-red-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
            >
              <HiOutlineTrash className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Active Filter Clear Bar */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>
            Showing {filteredMemories.length} of {memories.length} memories
          </span>
          <button
            type="button"
            onClick={clearFilters}
            className="font-semibold text-[#c0185a] hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Date-wise Gallery Layout */}
      {filteredMemories.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200/80 bg-[#fcfbfa] p-10 text-center shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <HiOutlinePhoto className="mx-auto h-9 w-9 text-zinc-300" />
          <p className="mt-2.5 text-sm font-medium text-zinc-800">
            {!loaded
              ? 'Loading family memories…'
              : hasActiveFilters
              ? 'No memories match the selected filters.'
              : 'No family memories published yet.'}
          </p>
          {isAdmin && loaded && !hasActiveFilters && (
            <button
              type="button"
              onClick={() => setUploadOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#e91e8c] px-4 py-2 text-xs font-semibold text-white hover:bg-[#c0185a]"
            >
              <HiOutlinePlus className="h-4 w-4" />
              Upload Photos &amp; Videos
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-7">
          {dateGroups.map((group) => (
            <section key={group.iso} aria-label={group.heading}>
              <div className="mb-2.5 flex items-baseline justify-between">
                <h2 className="text-sm font-semibold text-zinc-900">{group.heading}</h2>
                <span className="text-[11px] font-medium text-zinc-400">
                  {group.items.length} {group.items.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
                {group.items.map((memory) => {
                  const mediaSrc = memory.mediaUrl || memory.imageUrl || '';
                  const isVideo = memory.mediaType === 'video';
                  const isSelected = selectedIds.has(memory.id);
                  const flatIdx = flatOrderedMemories.findIndex((m) => m.id === memory.id);

                  return (
                    <div
                      key={memory.id}
                      onClick={() => {
                        if (selectMode) {
                          toggleSelect(memory.id);
                        } else if (flatIdx !== -1) {
                          setLightboxIndex(flatIdx);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          if (selectMode) toggleSelect(memory.id);
                          else if (flatIdx !== -1) setLightboxIndex(flatIdx);
                        }
                      }}
                      className={`group relative aspect-square cursor-pointer overflow-hidden rounded-xl bg-zinc-100 ring-1 transition-all ${
                        isSelected
                          ? 'ring-2 ring-[#e91e8c] ring-offset-2'
                          : 'ring-zinc-200/70 hover:ring-zinc-400'
                      }`}
                    >
                      {mediaSrc ? (
                        isVideo ? (
                          <video
                            src={mediaSrc}
                            muted
                            playsInline
                            preload="metadata"
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={mediaSrc}
                            alt={memory.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        )
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center bg-[#fcfbfa] p-3 text-center">
                          <span className="text-xs font-semibold text-zinc-800 line-clamp-2">
                            {memory.title}
                          </span>
                          {memory.note && (
                            <span className="mt-1 text-[10px] text-zinc-500 line-clamp-2">
                              {memory.note}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Video indicator badge */}
                      {isVideo && (
                        <div className="pointer-events-none absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-xs">
                          <HiOutlinePlay className="h-3 w-3 fill-white" />
                          {memory.durationSeconds ? formatDuration(memory.durationSeconds) : 'Video'}
                        </div>
                      )}

                      {/* Selection checkbox */}
                      {selectMode && (
                        <div
                          className={`absolute top-2 left-2 flex h-5 w-5 items-center justify-center rounded-full border text-white ${
                            isSelected
                              ? 'border-[#e91e8c] bg-[#e91e8c]'
                              : 'border-white bg-black/35'
                          }`}
                        >
                          {isSelected && <span className="text-[10px] font-bold">✓</span>}
                        </div>
                      )}

                      {/* Hover gradient overlay */}
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-2.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <p className="truncate text-xs font-semibold text-white">
                          {memory.title}
                        </p>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-white/80">
                          {memory.category && <span>{memory.category}</span>}
                          {memory.albumName && <span>· {memory.albumName}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <MemoryUploadModal
        open={uploadOpen}
        albums={albums}
        defaultAlbumId={albumFilter !== 'all' && albumFilter !== 'unassigned' ? albumFilter : ''}
        onClose={() => setUploadOpen(false)}
        onCreateAlbum={handleCreateAlbum}
        onUploadComplete={() => {}}
      />

      {/* Full-Screen Preview Lightbox */}
      <MemoryLightbox
        items={flatOrderedMemories}
        currentIndex={lightboxIndex}
        albums={albums}
        isAdmin={isAdmin}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
        onUpdateMemory={handleUpdateMemory}
        onDeleteMemory={handleDeleteMemory}
      />
    </div>
  );
}

