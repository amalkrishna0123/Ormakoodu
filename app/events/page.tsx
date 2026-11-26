'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '@/components/home/Navbar';
import HomeFooter from '@/components/home/HomeFooter';
import UpcomingEvents from '@/components/home/UpcomingEvents';
import FamilyHighlights from '@/components/home/FamilyHighlights';
import PageHeaderBanner from '@/components/common/PageHeaderBanner';
import { subscribePublicEvents } from '@/lib/firestoreService';
import { getUpcomingEvents } from '@/lib/eventUtils';
import type { CalendarEventDoc } from '@/lib/types';
import { HiOutlineCalendarDays } from 'react-icons/hi2';

export default function EventsPage() {
  const [events, setEvents] = useState<CalendarEventDoc[]>([]);

  useEffect(() => {
    const unsub = subscribePublicEvents(setEvents);
    return () => unsub();
  }, []);

  const upcomingCount = useMemo(() => getUpcomingEvents(events).length, [events]);

  return (
    <div
      className="flex min-h-screen flex-1 flex-col bg-white text-zinc-950"
      style={{ fontFamily: 'var(--font-geist-sans), sans-serif' }}
    >
      <Navbar />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 pt-6 pb-6 sm:px-6 lg:px-8">
        <PageHeaderBanner
          category="Events"
          title="Family Events & Occasions"
          malayalamSubtitle="പിറന്നാളുകൾ, വിവാഹ വാർഷികങ്ങൾ, കുടുംബ ആഘോഷങ്ങൾ"
          imageSrc="/images/headers/events-banner.jpg"
          imageAlt="Kerala family celebrating together around a lit brass nilavilakku lamp with marigold and jasmine flowers"
          imagePosition="center 35%"
          countLabel={`${upcomingCount} Upcoming`}
          icon={<HiOutlineCalendarDays className="h-3.5 w-3.5" aria-hidden="true" />}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <UpcomingEvents />
          <FamilyHighlights />
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}
