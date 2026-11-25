'use client';

/**
 * CalendarStyles – injects all Ormakoodu calendar CSS as a style tag.
 *
 * This approach is used instead of CSS Modules or additional CSS files because
 * @tailwindcss/turbopack v4.3.3 panics (Turbopack internal error) when it
 * encounters complex CSS features (keyframes, clip-path, clamp()) in any .css
 * file it processes. All custom styles are injected here at runtime, safely
 * outside the broken Turbopack CSS pipeline.
 */
export default function CalendarStyles() {
  return (
    <style>{`
      :root {
        --font-noto-malayalam: "Noto Sans Malayalam", sans-serif;
        --color-pink: #e91e8c;
        --color-pink-dark: #c0185a;
      }

      /* ── Paper container ───────────────────────────────── */
      .ok-paper-container {
        position: relative;
        width: 100%;
        max-width: 580px;
        margin: 0 auto;
      }

      /* Cylindrical roll at top */
      .ok-paper-roll {
        position: absolute;
        top: -6px;
        left: 0;
        right: 0;
        height: 12px;
        border-radius: 6px;
        background: linear-gradient(to bottom, #f5f0e8 0%, #e8dfd0 40%, #c8bfae 70%, #b8af9e 100%);
        box-shadow: 0 2px 8px rgba(0,0,0,0.18), 0 1px 2px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.5);
        z-index: 10;
      }

      /* Unrolling shadow */
      .ok-unroll-shadow {
        position: absolute;
        left: 0;
        right: 0;
        height: 10px;
        background: linear-gradient(to bottom, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0) 100%);
        pointer-events: none;
        z-index: 8;
        border-radius: 2px;
      }

      /* Paper surface */
      .ok-paper {
        position: relative;
        background: #fefefe;
        border-radius: 2px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 4px 20px rgba(0,0,0,0.06), 0 12px 40px rgba(0,0,0,0.04);
        overflow: hidden;
      }

      /* ── Calendar header ───────────────────────────────── */
      .ok-cal-header {
        position: relative;
        z-index: 1;
        padding: 20px 20px 14px;
        border-bottom: 2px solid #1a1a1a;
      }
      .ok-header-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 8px;
      }
      .ok-ml-month-name {
        font-family: var(--font-noto-malayalam);
        font-size: clamp(22px, 5vw, 32px);
        font-weight: 700;
        color: #1a1a1a;
        line-height: 1.1;
      }
      .ok-gr-month-year {
        font-size: clamp(13px, 2.5vw, 16px);
        font-weight: 500;
        color: #1a1a1a;
        text-align: right;
        line-height: 1.4;
      }
      .ok-gr-month-year span {
        display: block;
        font-size: 0.85em;
        color: #555;
        font-weight: 400;
        font-family: var(--font-noto-malayalam);
      }
      .ok-header-bottom {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 8px;
      }
      .ok-kollavarsham {
        font-family: var(--font-noto-malayalam);
        font-size: clamp(11px, 2vw, 13px);
        color: #666;
        font-weight: 400;
      }
      .ok-panchangam-info {
        font-family: var(--font-noto-malayalam);
        font-size: clamp(10px, 1.8vw, 12px);
        color: #888;
        text-align: right;
      }
      .ok-accent-line {
        width: 36px;
        height: 3px;
        background: #e91e8c;
        border-radius: 2px;
        margin-top: 10px;
      }

      /* ── Weekday header ────────────────────────────────── */
      .ok-weekday-header {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        position: relative;
        z-index: 1;
      }
      .ok-weekday-cell {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 8px 2px 7px;
        background: #2a2a2a;
        gap: 1px;
      }
      .ok-weekday-cell-sunday {
        background: #c0185a;
      }
      .ok-weekday-name {
        font-size: clamp(9px, 1.6vw, 11px);
        font-weight: 600;
        color: #fff;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        line-height: 1;
      }
      .ok-weekday-ml {
        font-family: var(--font-noto-malayalam);
        font-size: clamp(8px, 1.4vw, 10px);
        color: rgba(255,255,255,0.7);
        line-height: 1;
      }

      /* ── Date grid ─────────────────────────────────────── */
      .ok-date-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        position: relative;
        z-index: 1;
      }
      .ok-date-cell {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: clamp(6px, 1.5vw, 10px) clamp(2px, 0.5vw, 4px);
        border-right: 1px solid #f0f0f0;
        border-bottom: 1px solid #f0f0f0;
        min-height: clamp(60px, 11vw, 90px);
        cursor: default;
        position: relative;
        box-sizing: border-box;
      }
      .ok-date-cell:nth-child(7n) { border-right: none; }
      .ok-date-other-month { opacity: 0.35; }
      .ok-date-today { background: #fff5fa; }
      .ok-date-today::after {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 2px;
        background: #e91e8c;
      }
      .ok-date-sunday .ok-gregorian-date { color: #c0185a; }
      .ok-gregorian-date {
        font-size: clamp(18px, 3.5vw, 26px);
        font-weight: 700;
        color: #1a1a1a;
        line-height: 1;
        margin-bottom: 2px;
      }
      .ok-ml-date-num {
        font-family: var(--font-noto-malayalam);
        font-size: clamp(9px, 1.5vw, 11px);
        color: #888;
        line-height: 1;
        margin-bottom: 3px;
      }
      .ok-nakshatram-label {
        font-family: var(--font-noto-malayalam);
        font-size: clamp(7px, 1.2vw, 9px);
        color: #aaa;
        line-height: 1.2;
        text-align: center;
        word-break: break-word;
      }

      /* ── Footer ────────────────────────────────────────── */
      .ok-cal-footer {
        position: relative;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 10px 20px;
        border-top: 1px solid #f0f0f0;
        gap: 6px;
      }
      .ok-brand-name {
        font-size: 11px;
        font-weight: 600;
        color: #ccc;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .ok-brand-dot {
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: #e91e8c;
        opacity: 0.5;
      }

      /* ── Animation keyframes ───────────────────────────── */
      @keyframes ok-unroll-paper {
        0%   { transform: perspective(1200px) rotateX(-85deg) scaleY(0.04); opacity: 0.7; }
        10%  { transform: perspective(1200px) rotateX(-70deg) scaleY(0.12); opacity: 1; }
        40%  { transform: perspective(1200px) rotateX(-30deg) scaleY(0.6); }
        60%  { transform: perspective(1200px) rotateX(-8deg) scaleY(0.95); }
        70%  { transform: perspective(1200px) rotateX(3deg) scaleY(1); }
        78%  { transform: perspective(1200px) rotateX(-4deg) scaleY(1); }
        86%  { transform: perspective(1200px) rotateX(2deg) scaleY(1); }
        92%  { transform: perspective(1200px) rotateX(-1deg) scaleY(1); }
        100% { transform: perspective(1200px) rotateX(0deg) scaleY(1); opacity: 1; }
      }
      @keyframes ok-reveal-content {
        0%   { clip-path: inset(0 0 100% 0); }
        10%  { clip-path: inset(0 0 95% 0);  }
        60%  { clip-path: inset(0 0 5% 0);   }
        100% { clip-path: inset(0 0 0% 0);   }
      }
      @keyframes ok-roll-fade {
        0%,10% { opacity: 1; transform: scaleY(1); }
        40%    { opacity: 0.6; transform: scaleY(0.5); }
        70%    { opacity: 0; transform: scaleY(0); }
        100%   { opacity: 0; transform: scaleY(0); }
      }
      @keyframes ok-shadow-move {
        0%   { opacity: 0; top: 0; }
        10%  { opacity: 0.5; }
        60%  { opacity: 0.25; top: 95%; }
        70%  { top: 97%; }
        86%  { top: 95%; }
        100% { opacity: 0; top: 100%; }
      }
      @keyframes ok-fade-in {
        from { opacity: 0; }
        to   { opacity: 1; }
      }

      /* Animation classes */
      .ok-animating {
        will-change: transform, opacity;
        transform-origin: top center;
        animation: ok-unroll-paper 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
      }
      .ok-content-reveal {
        will-change: clip-path;
        animation: ok-reveal-content 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
      }
      .ok-roll-anim {
        animation: ok-roll-fade 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
      }
      .ok-shadow-anim {
        animation: ok-shadow-move 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
      }
      .ok-settled {
        will-change: auto;
        transform: none;
      }

      @media (prefers-reduced-motion: reduce) {
        .ok-animating {
          animation: ok-fade-in 0.3s ease both;
          transform: none;
        }
        .ok-content-reveal { animation: none; clip-path: none; }
        .ok-roll-anim, .ok-shadow-anim { display: none; }
      }

      /* ── Swipe / month-transition ──────────────────────────── */

      /*
       * ok-swipe-surface: covers the full paper so every pointer event
       * on the calendar is captured. touch-action: pan-y lets the browser
       * own vertical scrolling while our hook intercepts horizontal swipes.
       */
      .ok-swipe-surface {
        touch-action: pan-y;
        user-select: none;
        -webkit-user-select: none;
        overflow: hidden;
        position: relative;
      }

      /*
       * ok-slide-content: wraps the calendar content that slides in/out.
       * We use CSS classes (toggled from React state) to trigger the
       * animations rather than inline styles, keeping React rendering clean.
       */
      .ok-slide-content {
        width: 100%;
      }

      /* Idle / enter state — content visible, no transform */
      .ok-slide-enter {
        animation: ok-slide-in 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
      }

      /* Exit: slides out to the left (going to next month) */
      .ok-slide-exit-left {
        animation: ok-slide-out-left 0.28s cubic-bezier(0.55, 0, 0.1, 1) both;
        pointer-events: none;
      }

      /* Exit: slides out to the right (going to previous month) */
      .ok-slide-exit-right {
        animation: ok-slide-out-right 0.28s cubic-bezier(0.55, 0, 0.1, 1) both;
        pointer-events: none;
      }

      @keyframes ok-slide-in {
        /* Direction is determined by which exit fired before this.
           We always enter from a neutral (translateX 0) since the
           DOM swap happens between exit and enter. A subtle fade
           keeps the transition feeling like a page turn. */
        from { opacity: 0.4; transform: translateX(0) scale(0.98); }
        to   { opacity: 1;   transform: translateX(0) scale(1); }
      }

      @keyframes ok-slide-out-left {
        from { opacity: 1;   transform: translateX(0); }
        to   { opacity: 0;   transform: translateX(-6%); }
      }

      @keyframes ok-slide-out-right {
        from { opacity: 1;   transform: translateX(0); }
        to   { opacity: 0;   transform: translateX(6%); }
      }

      @media (prefers-reduced-motion: reduce) {
        .ok-slide-enter,
        .ok-slide-exit-left,
        .ok-slide-exit-right {
          animation: none;
          transform: none;
          opacity: 1;
        }
      }
    `}</style>
  );
}

