'use client';

import React, { useState } from 'react';
import Navbar from '@/components/home/Navbar';
import HomeFooter from '@/components/home/HomeFooter';
import PageHeaderBanner from '@/components/common/PageHeaderBanner';
import MemoriesGallery from '@/components/memories/MemoriesGallery';
import { HiOutlinePhoto } from 'react-icons/hi2';

export default function MemoriesPage() {
  const [memoryCount, setMemoryCount] = useState(0);

  return (
    <div
      className="flex min-h-screen flex-1 flex-col bg-white text-zinc-950"
      style={{ fontFamily: 'var(--font-geist-sans), sans-serif' }}
    >
      <Navbar />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-6 pb-8 sm:px-6 lg:px-8">
        <PageHeaderBanner
          category="Memories"
          title="Family Memories"
          malayalamSubtitle="കൂട്ടായ്മയുടെ പ്രിയപ്പെട്ട ഓർമ്മക്കുറിപ്പുകൾ"
          imageSrc="/images/headers/memories-banner.jpg"
          imageAlt="Sunlit traditional Kerala tharavadu veranda with a vintage family photo album, brass lamp, and jasmine flowers"
          imagePosition="center center"
          countLabel={`${memoryCount} Memories`}
          icon={<HiOutlinePhoto className="h-3.5 w-3.5" aria-hidden="true" />}
        />

        <MemoriesGallery onCountChange={setMemoryCount} />
      </main>

      <HomeFooter />
    </div>
  );
}
