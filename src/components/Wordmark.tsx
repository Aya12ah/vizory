/** "vizory" with the blinking cursor. Used large on the front page and small in the header (or, from
 *  900px on the regulation pages, in the left menu). Every copy carries the view transition name
 *  "wordmark", so on moving between pages the wordmark glides and scales from its old place to its
 *  new one (globals.css). Only one copy may be rendered at a time, or the browser skips the
 *  transition: the others are display: none. */
export const wordmarkClass = 'inline-flex items-center font-medium leading-none tracking-[-0.025em] text-ink [view-transition-name:wordmark]';

export function Wordmark() {
  return <>vizory<span className="inline-block w-[.16em] h-[.78em] ml-[.05em] rounded-sm bg-signal animate-blink"></span></>;
}
