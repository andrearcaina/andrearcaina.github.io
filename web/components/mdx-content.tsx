import { MDXRemote, MDXRemoteProps } from "next-mdx-remote/rsc";
import { JSX } from "react";
import { highlight } from "sugar-high";
import Image from "next/image";
import Link from "next/link";
import type { MDXComponents } from "mdx/types";

const components: MDXComponents = {
  Image,
  Link,

  code: ({ children, className, ...props }: any) => {
    const language = className?.replace("language-", "") || "";

    if (language && typeof children === "string") {
      const codeHTML = highlight(children);
      return (
        <code
          className="font-mono text-sm block"
          dangerouslySetInnerHTML={{ __html: codeHTML }}
          {...props}
        />
      );
    }

    return (
      <code
        className="bg-secondary px-1 py-px font-mono text-[0.82em] font-normal"
        {...props}
      >
        {children}
      </code>
    );
  },

  pre: ({ children, ...props }: any) => {
    return (
      <pre
        className="overflow-x-auto border border-border bg-card p-4 font-mono text-[0.8em]"
        {...props}
      >
        {children}
      </pre>
    );
  },

  h1: (props: any) => <h1 {...props} />,
  h2: (props: any) => <h2 {...props} />,
  h3: (props: any) => <h3 {...props} />,
  h4: (props: any) => <h4 {...props} />,
  h5: (props: any) => <h5 {...props} />,
  h6: (props: any) => <h6 {...props} />,
  hr: (props: any) => <hr className="my-10 border-border" {...props} />,

  p: (props: any) => <p {...props} />,
  ul: (props: any) => <ul className="ml-5 list-disc" {...props} />,
  ol: (props: any) => <ol className="ml-5 list-decimal" {...props} />,
  li: ({ children, ...props }: any) => {
    if (typeof children === "string") {
      const match = children.match(/^\[([ xX])\] (.*)/);

      if (match) {
        const checked = match[1].toLowerCase() === "x";
        const text = match[2];
        return (
          <li className="mb-2 flex items-center" {...props}>
            <input
              type="checkbox"
              checked={checked}
              readOnly
              className="mr-2 h-4 w-4 cursor-pointer accent-primary"
            />
            <span>{text}</span>
          </li>
        );
      }
    }

    return (
      <li className="mb-2" {...props}>
        {children}
      </li>
    );
  },

  blockquote: (props: any) => <blockquote {...props} />,

  strong: (props: any) => <strong className="font-medium" {...props} />,
  em: (props: any) => <em className="italic" {...props} />,

  a: (props: any) => (
    <a
      className="text-primary underline underline-offset-4"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),

  table: (props: any) => (
    <div className="mb-6 overflow-x-auto">
      <table className="w-full border-collapse border border-border" {...props} />
    </div>
  ),

  th: (props: any) => (
    <th
      className="border border-border bg-secondary px-4 py-2 text-left font-medium"
      {...props}
    />
  ),

  td: (props: any) => (
    <td className="border border-border px-4 py-2" {...props} />
  ),

  thead: (props: any) => <thead {...props} />,
  tbody: (props: any) => <tbody {...props} />,
  tr: (props: any) => <tr {...props} />,
};

export default function MDXContent(
  props: JSX.IntrinsicAttributes & MDXRemoteProps,
) {
  return (
    <MDXRemote
      {...props}
      components={{ ...components, ...(props.components || {}) }}
    />
  );
}
