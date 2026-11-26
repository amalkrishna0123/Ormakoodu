'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Navbar from '@/components/home/Navbar';
import HomeFooter from '@/components/home/HomeFooter';
import PageHeaderBanner from '@/components/common/PageHeaderBanner';
import { subscribePublicMemories } from '@/lib/firestoreService';
import type { MemoryDoc } from '@/lib/types';
import { HiOutlinePhoto } from 'react-icons/hi2';

export default function MemoriesPage() {
  const [memories, setMemories] = useState<MemoryDoc[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const unsub = subscribePublicMemories(
      (list) => {
        setMemories(list);
        setLoaded(true);
      },
      () => setLoaded(true)
    );
    return () => unsub();
  }, []);

  return (
    <div
      className="flex min-h-screen flex-1 flex-col bg-white text-zinc-950"
      style={{ fontFamily: 'var(--font-geist-sans), sans-serif' }}
    >
      <Navbar />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 pt-6 pb-6 sm:px-6 lg:px-8">
        <PageHeaderBanner
          category="Memories"
          title="Family Memories"
          malayalamSubtitle="കൂട്ടായ്മയുടെ പ്രിയപ്പെട്ട ഓർമ്മക്കുറിപ്പുകൾ"
          imageSrc="/images/headers/memories-banner.jpg"
          imageAlt="Sunlit traditional Kerala tharavadu veranda with a vintage family photo album, brass lamp, and jasmine flowers"
          imagePosition="center center"
          countLabel={`${memories.length} Memories`}
          icon={<HiOutlinePhoto className="h-3.5 w-3.5" aria-hidden="true" />}
        />

        {memories.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200/80 bg-[#fcfbfa] p-8 text-center shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <p className="text-sm font-medium text-zinc-800">
              {loaded ? 'No family memories published yet.' : 'Loading family memories…'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {memories.map((memory) => (
              <article
                key={memory.id}
                className="flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200/80 bg-[#fcfbfa] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
              >
                <div>
                  {memory.imageUrl && (
                    <div className="relative mb-3.5 h-36 w-full overflow-hidden rounded-xl bg-zinc-100">
                      <Image
                        src={memory.imageUrl}
                        alt={memory.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 300px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-[#c0185a]">
                    {memory.dateLabel}
                  </span>
                  <h2 className="mt-2 text-base font-semibold text-zinc-950">
                    {memory.title}
                  </h2>
                  {memory.malayalamTitle && (
                    <p
                      className="mt-0.5 text-xs font-medium text-zinc-500"
                      style={{
                        fontFamily: "var(--font-noto-malayalam), 'Noto Sans Malayalam', sans-serif",
                      }}
                    >
                      {memory.malayalamTitle}
                    </p>
                  )}
                  <p className="mt-3 text-xs leading-relaxed text-zinc-600">
                    {memory.note}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <HomeFooter />
    </div>
  );
}
