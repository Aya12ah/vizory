/** "vizory" with the blinking cursor. Used large on the front page and small in the header. */
export const wordmarkClass = 'inline-flex items-center font-medium leading-none tracking-[-0.025em] text-ink';

export function Wordmark() {
  return <>vizory<span className="inline-block w-[.16em] h-[.78em] ml-[.05em] rounded-sm bg-signal animate-blink"></span></>;
}
