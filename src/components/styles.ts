// Tailwind classes shared by several components.

/** Round 44px icon button in the header (links and buttons). */
export const iconButton =
  'flex items-center justify-center size-11 rounded-full p-0 border-none bg-transparent text-ink no-underline cursor-pointer ' +
  'font-sans font-medium text-[13px] leading-none tracking-[.02em] ' +
  'transition-[color,transform] duration-180 ease-[ease] hover:text-signal hover:[transform:translateY(-1px)_scale(1.06)] ' +
  'focus-visible:rounded-full aria-[current=page]:text-signal-text ' +
  '[&_svg]:size-5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[1.6] [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round]';

/** A text link in the signal colour, underlined on hover. */
export const signalLink = 'text-[14px] text-signal-text no-underline hover:underline hover:underline-offset-3';
