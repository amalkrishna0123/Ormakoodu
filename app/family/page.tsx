'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/home/Navbar';
import HomeFooter from '@/components/home/HomeFooter';
import PageHeaderBanner from '@/components/common/PageHeaderBanner';
import { subscribePublicFamilyMembers } from '@/lib/firestoreService';
import type { FamilyMemberDoc } from '@/lib/types';
import { HiOutlineUsers } from 'react-icons/hi2';

export default function FamilyPage() {
  const [members, setMembers] = useState<FamilyMemberDoc[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const unsub = subscribePublicFamilyMembers(
      (list) => {
        setMembers(list);
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
          category="Family Circle"
          title="Tharavadu Family Members"
          malayalamSubtitle="കുടുംബാംഗങ്ങളും ജന്മനക്ഷത്ര വിവരങ്ങളും"
          imageSrc="/images/headers/family-banner.jpg"
          imageAlt="Multi-generational Kerala family smiling together on the wooden veranda of a traditional tharavadu"
          imagePosition="center 25%"
          countLabel={`${members.length} Members`}
          icon={<HiOutlineUsers className="h-3.5 w-3.5" aria-hidden="true" />}
        />

        {members.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200/80 bg-[#fcfbfa] p-8 text-center shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <p className="text-sm font-medium text-zinc-800">
              {loaded ? 'No public family member profiles added yet.' : 'Loading family members…'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-4 rounded-2xl border border-zinc-200/80 bg-[#fcfbfa] p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-xs font-semibold text-white">
                  {member.initials}
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-zinc-950">
                    {member.name}
                  </h2>
                  <p className="text-xs text-zinc-500">
                    {member.role}
                    {member.birthStar ? ` · ${member.birthStar}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <HomeFooter />
    </div>
  );
}
