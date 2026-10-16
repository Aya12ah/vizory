import type { MDXComponents } from 'mdx/types';
import Link from 'next/link';

// How Markdown in src/content renders: the page title gets its class.
const components: MDXComponents = {
  h1: (props) => <h1 className="page-title" {...props} />,
  // Links to other pages of the site navigate without a full page load; others stay plain links.
  a: ({ href = '', ...props }) => href.startsWith('/')
    ? <Link href={href} {...props} />
    : <a href={href} rel={/^https?:/.test(href) ? 'noopener' : undefined} {...props} />,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
