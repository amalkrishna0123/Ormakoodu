import Navbar from '@/components/home/Navbar';
import HomeFooter from '@/components/home/HomeFooter';

const MEMORY_PREVIEWS = [
  {
    id: 'mem-1',
    title: 'Onam Sadhya at Tharavadu',
    malayalamTitle: 'തറവാട്ടിലെ ഓണസദ്യ',
    date: 'September 2026',
    note: 'Everyone gathered in the courtyard for the traditional banana-leaf feast.',
  },
  {
    id: 'mem-2',
    title: 'Vishu Kani Morning',
    malayalamTitle: 'വിഷുക്കണി പ്രഭാതം',
    date: 'April 2026',
    note: 'Early morning Vishukkani arranged by Amma with golden konna flowers.',
  },
  {
    id: 'mem-3',
    title: 'Achan’s Retirement Evening',
    malayalamTitle: 'അച്ഛന്റെ യാത്രയയപ്പ് സായാഹ്നം',
    date: 'January 2026',
    note: 'A quiet family dinner celebrating decades of dedication and warmth.',
  },
];

export default function MemoriesPage() {
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
            Memories
          </span>
          <h1 className="mt-2.5 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
            Family Memories
          </h1>
          <p
            className="mt-1 text-sm text-zinc-500"
            style={{
              fontFamily: "var(--font-noto-malayalam), 'Noto Sans Malayalam', sans-serif",
            }}
          >
            കുടുംബത്തിന്റെ പ്രിയപ്പെട്ട ഓർമ്മക്കുറിപ്പുകൾ
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MEMORY_PREVIEWS.map((memory) => (
            <article
              key={memory.id}
              className="flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-[#fcfbfa] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
            >
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-[#c0185a]">
                  {memory.date}
                </span>
                <h2 className="mt-2 text-base font-semibold text-zinc-950">
                  {memory.title}
                </h2>
                <p
                  className="mt-0.5 text-xs font-medium text-zinc-500"
                  style={{
                    fontFamily: "var(--font-noto-malayalam), 'Noto Sans Malayalam', sans-serif",
                  }}
                >
                  {memory.malayalamTitle}
                </p>
                <p className="mt-3 text-xs leading-relaxed text-zinc-600">
                  {memory.note}
                </p>
              </div>
            </article>
          ))}
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}

