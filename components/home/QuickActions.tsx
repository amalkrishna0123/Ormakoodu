'use client';

import React, { useState } from 'react';
import {
  QUICK_ACTIONS_PREVIEW,
  type QuickActionItem,
} from '@/lib/homePreviewData';

function ActionIcon({ name }: { name: QuickActionItem['iconName'] }) {
  switch (name) {
    case 'plus':
      return (
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12h14" />
          <path d="M12 5v14" />
        </svg>
      );
    case 'calendar-days':
      return (
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
          <line x1="16" x2="16" y1="2" y2="6" />
          <line x1="8" x2="8" y1="2" y2="6" />
          <line x1="3" x2="21" y1="10" y2="10" />
          <path d="M8 14h.01" />
          <path d="M12 14h.01" />
          <path d="M16 14h.01" />
          <path d="M8 18h.01" />
          <path d="M12 18h.01" />
        </svg>
      );
    case 'users':
      return (
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case 'sliders':
      return (
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="4" x2="4" y1="21" y2="14" />
          <line x1="4" x2="4" y1="10" y2="3" />
          <line x1="12" x2="12" y1="21" y2="12" />
          <line x1="12" x2="12" y1="8" y2="3" />
          <line x1="20" x2="20" y1="21" y2="16" />
          <line x1="20" x2="20" y1="12" y2="3" />
          <line x1="2" x2="6" y1="14" y2="14" />
          <line x1="10" x2="14" y1="8" y2="8" />
          <line x1="18" x2="22" y1="16" y2="16" />
        </svg>
      );
  }
}

export default function QuickActions() {
  const [selectedAction, setSelectedAction] = useState<QuickActionItem | null>(
    null
  );

  return (
    <section
      id="settings"
      className="rounded-2xl border border-zinc-200/80 bg-[#fcfbfa] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
      aria-labelledby="quick-actions-heading"
    >
      <div className="mb-3.5 flex items-center justify-between">
        <div>
          <h2
            id="quick-actions-heading"
            className="text-base font-semibold tracking-tight text-zinc-950"
          >
            Quick Actions
          </h2>
          <p className="text-xs text-zinc-500">
            Manage your family calendar
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {QUICK_ACTIONS_PREVIEW.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => setSelectedAction(action)}
            className={`group flex items-start gap-3 rounded-xl border p-3 text-left transition-all ${
              action.accent
                ? 'border-[#e91e8c]/25 bg-white hover:border-[#e91e8c] hover:shadow-[0_2px_10px_rgba(233,30,140,0.08)]'
                : 'border-zinc-200/70 bg-white hover:border-zinc-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
            }`}
          >
            <span
              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                action.accent
                  ? 'bg-[#fff0f7] text-[#e91e8c] group-hover:bg-[#e91e8c] group-hover:text-white'
                  : 'bg-zinc-100 text-zinc-700 group-hover:bg-zinc-900 group-hover:text-white'
              }`}
            >
              <ActionIcon name={action.iconName} />
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-semibold text-zinc-950">
                {action.label}
              </span>
              <span
                className="mt-0.5 block text-[11px] text-zinc-500"
                style={{
                  fontFamily:
                    "var(--font-noto-malayalam), 'Noto Sans Malayalam', sans-serif",
                }}
              >
                {action.malayalamLabel}
              </span>
            </span>
          </button>
        ))}
      </div>

      {selectedAction && (
        <div
          className="mt-3.5 flex items-center justify-between gap-3 rounded-xl border border-[#e91e8c]/20 bg-white px-3.5 py-2.5 text-xs"
          role="status"
        >
          <div className="min-w-0">
            <span className="font-semibold text-zinc-900">
              {selectedAction.label}:
            </span>{' '}
            <span className="text-zinc-500">{selectedAction.description}</span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedAction(null)}
            className="shrink-0 font-medium text-[#c0185a] hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}
    </section>
  );
}

