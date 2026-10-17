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

// Forms (the get-started flow). There is no preflight reset, so inputs set their font and box.
const button = 'inline-flex items-center justify-center gap-2 rounded-pill px-5 py-[11px] font-sans text-[14px] font-medium leading-none no-underline cursor-pointer transition-[color,background-color,box-shadow] duration-180 ease-[ease] disabled:opacity-50 disabled:cursor-default';
/** The main action: a filled pill in the signal colour. */
export const buttonPrimary = `${button} border-none bg-signal text-on-signal hover:bg-mint`;
/** A secondary action: an outlined pill. */
export const buttonSecondary = `${button} border-none bg-transparent text-ink shadow-[inset_0_0_0_1px_var(--outline)] hover:text-signal-text hover:shadow-[inset_0_0_0_1px_var(--signal)]`;
/** A text, email or date field, a list or a text area, without its width (fieldBase) and full width (field). */
export const fieldBase = 'block box-border font-sans text-[15px] leading-[1.4] text-ink bg-panel border border-solid border-outline rounded-md px-3 py-[10px] focus-visible:outline-2 focus-visible:outline-signal focus-visible:outline-offset-0 aria-[invalid=true]:border-amber';
export const field = `${fieldBase} w-full`;
/** One choice (radio or checkbox) as a card; marked when chosen. */
export const choice = 'flex items-start gap-3 rounded-md border border-solid border-line bg-panel px-4 py-3 text-[15px] leading-[1.4] text-ink cursor-pointer transition-[border-color,background-color] duration-180 ease-[ease] hover:border-outline has-[:checked]:border-signal has-[:checked]:bg-signal-dim has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-signal has-[:focus-visible]:outline-offset-2 [&>input]:mt-[3px] [&>input]:accent-[var(--signal)]';
