import { Suspense } from "react";
import { connection } from "next/server";
import { buildMonthData } from "@/lib/calendarData";
import CalendarPaper from "@/components/calendar/CalendarPaper";
import CalendarStyles from "@/components/calendar/CalendarStyles";
import Navbar from "@/components/home/Navbar";
import HighlightCarousel from "@/components/home/HighlightCarousel";
import FamilyHighlights from "@/components/home/FamilyHighlights";
import UpcomingEvents from "@/components/home/UpcomingEvents";
import QuickActions from "@/components/home/QuickActions";
import HomeFooter from "@/components/home/HomeFooter";

/**
 * DynamicCalendar — server component that builds the initial month data at
 * request time (SSR).  CalendarPaper is a client component that takes over
 * month navigation from that seed value; it never re-fetches from the server.
 */
async function DynamicCalendar() {
  await connection();
  // Build the initial month data server-side so the first render is correct.
  // CalendarPaper's internal state drives all subsequent month changes.
  const initialMonthData = buildMonthData();
  return <CalendarPaper monthData={initialMonthData} />;
}

export default function Home() {
  return (
    <div
      id="top"
      className="flex min-h-screen flex-1 flex-col bg-white text-zinc-950"
      style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}
    >
      {/* Inject protected calendar styles (unchanged) */}
      <CalendarStyles />

      {/* Top Navigation */}
      <Navbar />

      <main className="flex-1">
        {/* Welcome Banner */}
        {/* <WelcomeSection /> */}
        <div className="px-2">
          <HighlightCarousel />
        </div>

        {/* Main Content: Protected Calendar (primary) + Companion Family Sections */}
        <div className="mx-auto w-full max-w-6xl px-4 pt-2 pb-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,580px)_minmax(300px,1fr)] lg:gap-12">
            {/* Existing Calendar Component – Preserved Exactly As Approved */}
            <section
              id="calendar"
              aria-label="Malayalam Family Calendar"
              className="mx-auto w-full pt-2 lg:mx-0"
              style={{ maxWidth: "580px" }}
            >
              <Suspense fallback={null}>
                <DynamicCalendar />
              </Suspense>
            </section>

            {/* Companion Family UI */}
            <aside
              aria-label="Family highlights, upcoming events, and quick actions"
              className="mx-auto flex w-full max-w-[580px] flex-col gap-6 lg:mx-0 lg:max-w-none"
            >
              {/* <HighlightCarousel items={HIGHLIGHT_CAROUSEL_ITEMS} /> */}
              <FamilyHighlights />
              <UpcomingEvents />
              <QuickActions />
            </aside>
          </div>
        </div>
      </main>

      {/* Footer */}
      <HomeFooter />
    </div>
  );
}
