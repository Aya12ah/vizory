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
const button = 'inline-flex items-center justify-center gap-2 h-11 box-border rounded-md px-5 font-sans text-[15px] font-medium leading-none no-underline whitespace-nowrap cursor-pointer transition-[color,background-color,box-shadow,opacity] duration-180 ease-[ease] disabled:opacity-35 disabled:cursor-default';
/** The main action: a filled pill in the signal colour. */
export const buttonPrimary = `${button} border-none bg-signal text-on-signal not-disabled:hover:bg-mint`;
/** A secondary action: an outlined pill. */
export const buttonSecondary = `${button} border-none bg-transparent text-ink shadow-[inset_0_0_0_1px_var(--outline)] not-disabled:hover:text-signal-text not-disabled:hover:shadow-[inset_0_0_0_1px_var(--signal)]`;
/** A text, email or date field, a list or a text area, without its width (fieldBase) and full width
 *  (field). Focused, it keeps clear of the bar at the bottom of the get-started page. */
export const fieldBase = 'block box-border font-sans text-[15px] leading-[1.4] text-ink bg-panel border border-solid border-outline rounded-md px-3 py-[10px] scroll-mb-28 focus-visible:outline-2 focus-visible:outline-signal focus-visible:outline-offset-0 aria-[invalid=true]:border-amber';
export const field = `${fieldBase} w-full`;
/** One choice (radio or checkbox) as a card, marked when chosen. The input itself is invisible and
 *  covers the card (choiceInput); choiceBox draws it. */
export const choice = 'group relative flex items-center gap-[14px] min-h-16 box-border rounded-[12px] border border-solid border-line bg-panel px-[18px] py-3 text-[16px] leading-[1.35] text-ink cursor-pointer transition-[border-color,background-color] duration-180 ease-[ease] hover:border-outline has-[:checked]:border-signal has-[:checked]:bg-signal-dim has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-signal has-[:focus-visible]:outline-offset-2';
export const choiceInput = 'absolute inset-0 m-0 size-full opacity-0 cursor-pointer scroll-mb-28';
/** The drawn checkbox or radio of a choice: `round` for a radio. */
export const choiceBox = (round: boolean) =>
  `flex-none flex items-center justify-center size-[22px] box-border border-[1.5px] border-solid border-ink-soft transition-[background-color,border-color] duration-180 ease-[ease] group-has-[:checked]:border-signal ${round ? 'rounded-full' : 'rounded-[6px] group-has-[:checked]:bg-signal'} [&>svg]:opacity-0 group-has-[:checked]:[&>svg]:opacity-100`;
