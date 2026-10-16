/** "vizory" with the blinking cursor. The caller sets the size class (wm-lg or wm-sm). */
export function Wordmark() {
  return <>vizory<span className="cur"></span></>;
}
