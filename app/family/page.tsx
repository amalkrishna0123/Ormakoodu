import Navbar from '@/components/home/Navbar';
import HomeFooter from '@/components/home/HomeFooter';
import { FAMILY_MEMBERS_SUMMARY } from '@/lib/homePreviewData';

export default function FamilyPage() {
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
            Family Circle
          </span>
          <h1 className="mt-2.5 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
            Tharavadu Family Members
          </h1>
          <p
            className="mt-1 text-sm text-zinc-500"
            style={{
              fontFamily: "var(--font-noto-malayalam), 'Noto Sans Malayalam', sans-serif",
            }}
          >
            കുടുംബാംഗങ്ങളും ജന്മനക്ഷത്ര വിവരങ്ങളും
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FAMILY_MEMBERS_SUMMARY.map((member) => (
            <div
              key={member.name}
              className="flex items-center gap-4 rounded-2xl border border-zinc-200/80 bg-[#fcfbfa] p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-xs font-semibold text-white">
                {member.initials}
              </span>
              <div>
                <h2 className="text-sm font-semibold text-zinc-950">
                  {member.name}
                </h2>
                <p className="text-xs text-zinc-500">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}

