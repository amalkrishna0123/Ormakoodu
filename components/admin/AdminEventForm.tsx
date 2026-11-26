'use client';

import React, { useEffect, useState } from 'react';
import {
  createOrUpdateEvent,
} from '@/lib/firestoreService';
import {
  deleteImageFromCloudinary,
  uploadImageToCloudinary,
  validateImageFile,
} from '@/lib/cloudinaryUpload';
import type {
  CalendarEventDoc,
  EventCategoryDetails,
  EventCategoryDoc,
  EventVisibility,
} from '@/lib/types';

interface AdminEventFormProps {
  categories: EventCategoryDoc[];
  editingEvent?: CalendarEventDoc | null;
  onSaved: () => void;
  onCancelEdit?: () => void;
}

export default function AdminEventForm({
  categories,
  editingEvent,
  onSaved,
  onCancelEdit,
}: AdminEventFormProps) {
  const [categorySlug, setCategorySlug] = useState<string>(
    editingEvent?.categorySlug || categories[0]?.slug || 'birthday'
  );
  const [eventDate, setEventDate] = useState(editingEvent?.eventDate || '');
  const [title, setTitle] = useState(editingEvent?.title || '');
  const [malayalamTitle, setMalayalamTitle] = useState(
    editingEvent?.malayalamTitle || ''
  );
  const [description, setDescription] = useState(editingEvent?.description || '');
  const [visibility, setVisibility] = useState<EventVisibility>(
    editingEvent?.visibility || 'public'
  );
  const [startTime, setStartTime] = useState(editingEvent?.startTime || '');
  const [endTime, setEndTime] = useState(editingEvent?.endTime || '');
  const [yearlyRecurrence, setYearlyRecurrence] = useState(
    editingEvent?.recurrence?.type === 'yearly'
  );
  const [details, setDetails] = useState<EventCategoryDetails>(
    editingEvent?.details || {}
  );

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState(
    editingEvent?.imageUrl || ''
  );
  const [existingPublicId, setExistingPublicId] = useState(
    editingEvent?.imagePublicId || ''
  );
  const [removeImage, setRemoveImage] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingEvent) {
      setCategorySlug(editingEvent.categorySlug);
      setEventDate(editingEvent.eventDate);
      setTitle(editingEvent.title);
      setMalayalamTitle(editingEvent.malayalamTitle || '');
      setDescription(editingEvent.description || '');
      setVisibility(editingEvent.visibility);
      setStartTime(editingEvent.startTime || '');
      setEndTime(editingEvent.endTime || '');
      setYearlyRecurrence(editingEvent.recurrence?.type === 'yearly');
      setDetails(editingEvent.details || {});
      setExistingImageUrl(editingEvent.imageUrl || '');
      setExistingPublicId(editingEvent.imagePublicId || '');
      setSelectedFile(null);
      setRemoveImage(false);
      setError(null);
    }
  }, [editingEvent]);

  const updateDetail = (key: keyof EventCategoryDetails, value: string) => {
    setDetails((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const err = validateImageFile(file);
      if (err) {
        setError(err);
        e.target.value = '';
        return;
      }
      setError(null);
      setRemoveImage(false);
    }
    setSelectedFile(file);
  };

  const validateRequiredFields = (): string | null => {
    if (!categorySlug) return 'Please select an event category.';
    if (!eventDate) return 'Event date is required.';
    if (!title.trim()) return 'Event title is required.';

    switch (categorySlug) {
      case 'birthday':
        if (!details.personName?.trim()) return "Birthday person's name is required.";
        if (!details.dateOfBirth) return 'Date of birth is required.';
        break;
      case 'anniversary':
        if (!details.coupleNames?.trim()) return 'Couple names are required.';
        if (!details.anniversaryDate) return 'Anniversary date is required.';
        break;
      case 'trip':
        if (!details.destination?.trim()) return 'Trip destination is required.';
        if (!details.departureDate) return 'Departure date is required.';
        if (!details.returnDate) return 'Return date is required.';
        break;
      case 'movie':
        if (!details.movieName?.trim()) return 'Movie name is required.';
        if (!details.platformOrTheatre?.trim()) {
          return 'Theatre or streaming platform is required.';
        }
        break;
      case 'entertainment':
        if (!details.programmeName?.trim()) return 'Activity or programme name is required.';
        if (!details.location?.trim()) return 'Location is required.';
        break;
      case 'festival':
        if (!details.festivalName?.trim()) return 'Festival name is required.';
        break;
      case 'family_gathering':
        if (!details.venue?.trim()) return 'Venue is required.';
        if (!details.participants?.trim()) return 'Participants are required.';
        break;
      case 'religious_cultural':
        if (!details.occasionName?.trim()) return 'Occasion name is required.';
        break;
      case 'personal_reminder':
        if (!details.reminderTitle?.trim()) return 'Reminder title is required.';
        break;
      case 'other':
        if (!details.customTitle?.trim()) return 'Custom title is required.';
        break;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationErr = validateRequiredFields();
    if (validationErr) {
      setError(validationErr);
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl = removeImage ? '' : existingImageUrl;
      let imagePublicId = removeImage ? '' : existingPublicId;

      if (selectedFile) {
        const uploaded = await uploadImageToCloudinary(selectedFile, 'ormakoodu/events');
        if (existingPublicId && existingPublicId !== uploaded.publicId) {
          await deleteImageFromCloudinary(existingPublicId).catch(() => {});
        }
        imageUrl = uploaded.secureUrl;
        imagePublicId = uploaded.publicId;
      } else if (removeImage && existingPublicId) {
        await deleteImageFromCloudinary(existingPublicId).catch(() => {});
      }

      const selectedCat = categories.find((c) => c.slug === categorySlug);

      await createOrUpdateEvent(
        {
          categoryId: selectedCat?.id || categorySlug,
          categorySlug,
          categoryName: selectedCat?.name || categorySlug,
          eventDate,
          title: title.trim(),
          ...(malayalamTitle.trim() ? { malayalamTitle: malayalamTitle.trim() } : {}),
          description: description.trim(),
          ...(imageUrl ? { imageUrl } : {}),
          ...(imagePublicId ? { imagePublicId } : {}),
          visibility,
          ...(startTime ? { startTime } : {}),
          ...(endTime ? { endTime } : {}),
          recurrence: yearlyRecurrence
            ? { type: 'yearly', monthDay: eventDate.slice(5) }
            : { type: 'none' },
          details,
        },
        editingEvent?.id
      );

      // Reset if creating new
      if (!editingEvent) {
        setTitle('');
        setMalayalamTitle('');
        setDescription('');
        setStartTime('');
        setEndTime('');
        setDetails({});
        setSelectedFile(null);
        setExistingImageUrl('');
        setExistingPublicId('');
      }

      onSaved();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to save event. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-zinc-200 bg-[#fcfbfa] p-5"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-zinc-950">
          {editingEvent ? 'Edit Event' : 'Create New Event'}
        </h3>
        {editingEvent && onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-xs font-medium text-zinc-500 hover:text-zinc-900"
          >
            Cancel Edit
          </button>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700"
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-zinc-700">
            Event Category *
          </label>
          <select
            value={categorySlug}
            onChange={(e) => {
              setCategorySlug(e.target.value);
              setDetails({});
            }}
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-[#e91e8c] focus:outline-none"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-700">
            Event Date *
          </label>
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            required
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-[#e91e8c] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-700">
            Event Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Amma's Birthday"
            required
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-[#e91e8c] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-700">
            Malayalam Title (Optional)
          </label>
          <input
            type="text"
            value={malayalamTitle}
            onChange={(e) => setMalayalamTitle(e.target.value)}
            placeholder="e.g., അമ്മയുടെ പിറന്നാൾ"
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-[#e91e8c] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-700">
            Start Time (Optional)
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-[#e91e8c] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-700">
            End Time (Optional)
          </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-[#e91e8c] focus:outline-none"
          />
        </div>
      </div>

      {/* Category-specific Conditional Fields */}
      <div className="rounded-xl border border-zinc-200/80 bg-white p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#c0185a]">
          Category Details
        </p>

        {categorySlug === 'birthday' && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-zinc-700">
                Birthday Person&apos;s Name *
              </label>
              <input
                type="text"
                value={details.personName || ''}
                onChange={(e) => updateDetail('personName', e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700">
                Date of Birth *
              </label>
              <input
                type="date"
                value={details.dateOfBirth || ''}
                onChange={(e) => updateDetail('dateOfBirth', e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}

        {categorySlug === 'anniversary' && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-zinc-700">
                Couple Names *
              </label>
              <input
                type="text"
                value={details.coupleNames || ''}
                onChange={(e) => updateDetail('coupleNames', e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700">
                Anniversary Date *
              </label>
              <input
                type="date"
                value={details.anniversaryDate || ''}
                onChange={(e) => updateDetail('anniversaryDate', e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}

        {categorySlug === 'trip' && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-zinc-700">
                Destination *
              </label>
              <input
                type="text"
                value={details.destination || ''}
                onChange={(e) => updateDetail('destination', e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700">
                Departure Date *
              </label>
              <input
                type="date"
                value={details.departureDate || ''}
                onChange={(e) => updateDetail('departureDate', e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700">
                Return Date *
              </label>
              <input
                type="date"
                value={details.returnDate || ''}
                onChange={(e) => updateDetail('returnDate', e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-zinc-700">
                Trip Notes
              </label>
              <textarea
                rows={2}
                value={details.notes || ''}
                onChange={(e) => updateDetail('notes', e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}

        {categorySlug === 'movie' && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-zinc-700">
                Movie Name *
              </label>
              <input
                type="text"
                value={details.movieName || ''}
                onChange={(e) => updateDetail('movieName', e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700">
                Theatre or Streaming Platform *
              </label>
              <input
                type="text"
                value={details.platformOrTheatre || ''}
                onChange={(e) => updateDetail('platformOrTheatre', e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}

        {categorySlug === 'entertainment' && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-zinc-700">
                Activity or Programme Name *
              </label>
              <input
                type="text"
                value={details.programmeName || ''}
                onChange={(e) => updateDetail('programmeName', e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700">
                Location *
              </label>
              <input
                type="text"
                value={details.location || ''}
                onChange={(e) => updateDetail('location', e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}

        {categorySlug === 'festival' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700">
                Festival Name *
              </label>
              <input
                type="text"
                value={details.festivalName || ''}
                onChange={(e) => updateDetail('festivalName', e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700">
                Celebration Details
              </label>
              <textarea
                rows={2}
                value={details.celebrationDetails || ''}
                onChange={(e) => updateDetail('celebrationDetails', e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}

        {categorySlug === 'family_gathering' && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-zinc-700">
                Venue *
              </label>
              <input
                type="text"
                value={details.venue || ''}
                onChange={(e) => updateDetail('venue', e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700">
                Participants *
              </label>
              <input
                type="text"
                value={details.participants || ''}
                onChange={(e) => updateDetail('participants', e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}

        {categorySlug === 'religious_cultural' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700">
                Occasion Name *
              </label>
              <input
                type="text"
                value={details.occasionName || ''}
                onChange={(e) => updateDetail('occasionName', e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700">
                Details
              </label>
              <textarea
                rows={2}
                value={details.details || ''}
                onChange={(e) => updateDetail('details', e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}

        {categorySlug === 'personal_reminder' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700">
                Reminder Title *
              </label>
              <input
                type="text"
                value={details.reminderTitle || ''}
                onChange={(e) => updateDetail('reminderTitle', e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700">
                Reminder Description
              </label>
              <textarea
                rows={2}
                value={details.reminderDescription || ''}
                onChange={(e) => updateDetail('reminderDescription', e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}

        {categorySlug === 'other' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700">
                Custom Title *
              </label>
              <input
                type="text"
                value={details.customTitle || ''}
                onChange={(e) => updateDetail('customTitle', e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700">
                Description
              </label>
              <textarea
                rows={2}
                value={details.customDescription || ''}
                onChange={(e) => updateDetail('customDescription', e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-medium text-zinc-700">
          Description
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-[#e91e8c] focus:outline-none"
        />
      </div>

      {/* Image Upload (Cloudinary) */}
      <div>
        <label className="block text-xs font-medium text-zinc-700">
          Event Image (JPEG, PNG, WebP, AVIF · max 5 MB)
        </label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={handleFileChange}
          className="mt-1 block w-full text-xs text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#fff0f7] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#c0185a]"
        />
        {existingImageUrl && !removeImage && !selectedFile && (
          <div className="mt-2 flex items-center gap-3">
            <span className="truncate text-xs text-zinc-500">Current image attached</span>
            <button
              type="button"
              onClick={() => setRemoveImage(true)}
              className="text-xs font-medium text-red-600 hover:underline"
            >
              Remove Image
            </button>
          </div>
        )}
      </div>

      {/* Visibility & Yearly Recurrence */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-zinc-700">Visibility:</label>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as EventVisibility)}
            className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs"
          >
            <option value="public">Public</option>
            <option value="private">Private (Admin only)</option>
          </select>
        </div>

        <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-zinc-700">
          <input
            type="checkbox"
            checked={yearlyRecurrence}
            onChange={(e) => setYearlyRecurrence(e.target.checked)}
            className="h-4 w-4 accent-[#e91e8c]"
          />
          Repeat yearly
        </label>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-[#e91e8c] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#c0185a] disabled:opacity-50"
      >
        {submitting
          ? 'Saving Event…'
          : editingEvent
          ? 'Update Event'
          : 'Save Event'}
      </button>
    </form>
  );
}

