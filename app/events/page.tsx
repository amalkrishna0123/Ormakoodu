import Navbar from '@/components/home/Navbar';
import HomeFooter from '@/components/home/HomeFooter';
import UpcomingEvents from '@/components/home/UpcomingEvents';
import FamilyHighlights from '@/components/home/FamilyHighlights';

export default function EventsPage() {
  return (
    <div
      className="flex min-h-screen flex-1 flex-col bg-white text-zinc-950"
      style={{ fontFamily: 'var(--font-geist-sans), sans-serif' }}
    >
      <Navbar />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 pt-8 pb-6 sm:px-6 lg:px-8">
        <div className="mb-6 border-b border-zinc-100 pb-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff5fa] px-3 py-1 text-xs font-medium text-[#c0185a]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#e91e8c]" aria-hidden="true" />
            Events
          </span>
          <h1 className="mt-2.5 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
            Family Events &amp; Occasions
          </h1>
          <p
            className="mt-1 text-sm text-zinc-500"
            style={{
              fontFamily: "var(--font-noto-malayalam), 'Noto Sans Malayalam', sans-serif",
            }}
          >
            പിറന്നാളുകൾ, വിവാഹ വാർഷികങ്ങൾ, കുടുംബ ചടങ്ങുകൾ
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <UpcomingEvents />
          <FamilyHighlights />
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}

