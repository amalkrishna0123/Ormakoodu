'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HiHome,
  HiOutlineHome,
  HiCalendarDays,
  HiOutlineCalendarDays,
  HiUsers,
  HiOutlineUsers,
  HiPhoto,
  HiOutlinePhoto,
  HiCog6Tooth,
  HiOutlineCog6Tooth,
} from 'react-icons/hi2';

interface NavItem {
  label: string;
  href: string;
  activeIcon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  inactiveIcon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Home',
    href: '/',
    activeIcon: HiHome,
    inactiveIcon: HiOutlineHome,
  },
  {
    label: 'Events',
    href: '/events',
    activeIcon: HiCalendarDays,
    inactiveIcon: HiOutlineCalendarDays,
  },
  {
    label: 'Family',
    href: '/family',
    activeIcon: HiUsers,
    inactiveIcon: HiOutlineUsers,
  },
  {
    label: 'Memories',
    href: '/memories',
    activeIcon: HiPhoto,
    inactiveIcon: HiOutlinePhoto,
  },
  {
    label: 'Settings',
    href: '/settings',
    activeIcon: HiCog6Tooth,
    inactiveIcon: HiOutlineCog6Tooth,
  },
];

export default function BottomNavigation() {
  const pathname = usePathname();

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-40 flex justify-center px-3 sm:px-6"
      style={{ bottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}
    >
      <nav
        aria-label="Bottom navigation"
        className="pointer-events-auto w-full max-w-md rounded-2xl border border-zinc-200/80 bg-white/95 px-1.5 py-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md sm:max-w-lg sm:px-2"
      >
        <ul className="grid grid-cols-5 items-center">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
            const Icon = isActive ? item.activeIcon : item.inactiveIcon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e91e8c]/40 ${
                    isActive
                      ? 'bg-[#fff5fa]'
                      : 'hover:bg-zinc-50'
                  }`}
                >
                  <Icon
                    aria-hidden={true}
                    className={`h-5 w-5 transition-colors ${
                      isActive ? 'text-[#e91e8c]' : 'text-black'
                    }`}
                  />
                  <span
                    className={`text-[11px] leading-tight tracking-tight ${
                      isActive
                        ? 'font-semibold text-[#c0185a]'
                        : 'font-medium text-zinc-800'
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

