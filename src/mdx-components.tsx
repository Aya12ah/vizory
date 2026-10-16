import type { MDXComponents } from 'mdx/types';

// How Markdown in src/content renders: the page title gets its class, external links open as before.
const components: MDXComponents = {
  h1: (props) => <h1 className="page-title" {...props} />,
  a: ({ href = '', ...props }) => <a href={href} rel={/^https?:/.test(href) ? 'noopener' : undefined} {...props} />,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
