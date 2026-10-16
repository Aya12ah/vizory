/** Replays the small press animation on an icon button. */
export function pop(el: HTMLElement) {
  el.classList.remove('pop');
  void el.offsetWidth;
  el.classList.add('pop');
}
