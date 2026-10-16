'use client';
import { useEffect, useState } from 'react';

// The address is kept out of the page source as plain text and as a mailto link that simple
// harvesting bots read: it is stored reversed and assembled in the browser.
const USER = 'olleh';
const DOMAIN = 'kd.yroziv';
const rev = (x: string) => x.split('').reverse().join('');

export function Mail() {
  const [addr, setAddr] = useState<string | null>(null);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- must run in the browser only, never on the server
  useEffect(() => setAddr(rev(USER) + '@' + rev(DOMAIN)), []);
  return (
    <a className="text-inherit no-underline transition-[color] duration-180 ease-[ease] hover:text-signal-text hover:underline hover:underline-offset-3" href={addr ? 'mailto:' + addr : undefined} hidden={!addr}>
      {addr}
    </a>
  );
}
