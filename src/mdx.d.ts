declare module '*.mdx' {
  import type { ComponentType } from 'react';
  const Content: ComponentType;
  export default Content;
  /** The guide's table of contents, exported by the guides in src/content. */
  export const toc: import('@/components/Toc').TocItem[];
}
