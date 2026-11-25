import React from 'react';
import Image from 'next/image';

export interface PageHeaderBannerProps {
  /** Short category label shown next to the pink indicator */
  category: string;
  /** Main English page heading */
  title: string;
  /** Malayalam supporting subtitle */
  malayalamSubtitle: string;
  /** Path to the photographic banner asset in /public */
  imageSrc: string;
  /** Accessible description of the banner photograph */
  imageAlt: string;
  /** Optional CSS object-position value for focal point tuning (default: "center center") */
  imagePosition?: string;
  /** Optional dynamic count text (e.g. "4 Upcoming", "5 Members") */
  countLabel?: string;
  /** Optional react-icons element displayed alongside the category */
  icon?: React.ReactNode;
}

export default function PageHeaderBanner({
  category,
  title,
  malayalamSubtitle,
  imageSrc,
  imageAlt,
  imagePosition = 'center center',
  countLabel,
  icon,
}: PageHeaderBannerProps) {
  return (
    <header className="mb-7">
      <div className="relative h-[200px] w-full overflow-hidden rounded-[20px] bg-zinc-900 sm:h-[250px] md:h-[280px]">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 896px"
          className="object-cover"
          style={{ objectPosition: imagePosition }}
        />

        {/* Subtle dark gradient scrim for crisp white text contrast */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10"
          aria-hidden="true"
        />

        {/* Bottom-left editorial title block */}
        <div className="absolute inset-x-5 bottom-5 sm:inset-x-7 sm:bottom-6">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <span
              className="h-2 w-2 shrink-0 rounded-full bg-[#e91e8c]"
              aria-hidden="true"
            />
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/90">
              {icon}
              <span>{category}</span>
            </span>
            {countLabel && (
              <span className="text-[11px] font-medium text-white/75">
                <span className="mr-1.5" aria-hidden="true">
                  ·
                </span>
                {countLabel}
              </span>
            )}
          </div>

          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl md:text-[28px] md:leading-tight">
            {title}
          </h1>

          <p
            className="mt-1 text-xs font-normal text-white/85 sm:text-sm"
            style={{
              fontFamily:
                "var(--font-noto-malayalam), 'Noto Sans Malayalam', sans-serif",
            }}
          >
            {malayalamSubtitle}
          </p>
        </div>
      </div>
    </header>
  );
}

