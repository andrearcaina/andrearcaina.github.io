import { MDXRemote, MDXRemoteProps } from "next-mdx-remote/rsc";
import { JSX } from "react";
import { highlight } from "sugar-high";
import Image from 'next/image';
import Link from 'next/link';
import type { MDXComponents } from 'mdx/types';

const components: MDXComponents = {
    Image,
    Link,
    
    code: ({ children, className, ...props }: any) => {
        const language = className?.replace('language-', '') || '';
        
        if (language && typeof children === 'string') {
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
                className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono font-semibold" 
                {...props}
            >
                {children}
            </code>
        );
    },
    
    pre: ({ children, ...props }: any) => {
        return (
            <pre className="overflow-x-auto rounded-lg border bg-muted p-4 font-mono text-sm" {...props}>
                {children}
            </pre>
        );
    },
    
    h1: (props: any) => <h1 className="text-3xl font-bold tracking-tight mb-4" {...props} />,
    h2: (props: any) => <h2 className="text-2xl font-semibold tracking-tight mb-3 mt-8" {...props} />,
    h3: (props: any) => <h3 className="text-xl font-semibold tracking-tight mb-2 mt-6" {...props} />,
    h4: (props: any) => <h4 className="text-lg font-semibold tracking-tight mb-2 mt-4" {...props} />,
    h5: (props: any) => <h5 className="text-base font-semibold tracking-tight mb-2 mt-3" {...props} />,
    h6: (props: any) => <h6 className="text-sm font-semibold tracking-tight mb-2 mt-3" {...props} />,
    hr: (props: any) => <hr className="my-8 border-border" {...props} />,

    p: (props: any) => <p className="mb-4 leading-7" {...props} />,
    ul: (props: any) => <ul className="mb-4 ml-6 list-disc space-y-1" {...props} />,
    ol: (props: any) => <ol className="mb-4 ml-6 list-decimal space-y-1" {...props} />,
    li: ({ children, ...props }: any) => {
        if (typeof children === 'string') {
            const match = children.match(/^\[([ xX])\] (.*)/)
            
            if (match) {
                const checked = match[1].toLowerCase() === 'x'
                const text = match[2]
                return (
                    <li className="flex items-center leading-7 mb-2" {...props}>
                        <input
                            type="checkbox"
                            checked={checked}
                            readOnly
                            className="mr-2 h-4 w-4 cursor-pointer accent-primary"
                        />
                        <span>{text}</span>
                    </li>
                )
            }
        }

        return <li className="leading-7 mb-2" {...props}>{children}</li>
    },
    
    blockquote: (props: any) => (
        <blockquote className="mb-4 border-l-4 border-border bg-muted/50 pl-4 py-2 italic" {...props} />
    ),
    
    strong: (props: any) => <strong className="font-semibold" {...props} />,
    em: (props: any) => <em className="italic" {...props} />,
    
    a: (props: any) => (
        <a 
            className="text-primary underline underline-offset-4 hover:text-primary/80" 
            target="_blank"
            rel="noopener noreferrer"
            {...props} 
        />
    ),
    
    table: (props: any) => (
        <div className="overflow-x-auto mb-4">
            <table 
                className="w-full border-collapse border border-border rounded-lg"
                {...props}
            />
        </div>
    ),
    
    th: (props: any) => (
        <th 
            className="border border-border bg-muted px-4 py-2 text-left font-semibold"
            {...props}
        />
    ),
    
    td: (props: any) => (
        <td 
            className="border border-border px-4 py-2"
            {...props}
        />
    ),
    
    thead: (props: any) => <thead className="bg-muted" {...props} />,
    tbody: (props: any) => <tbody {...props} />,
    tr: (props: any) => <tr className="border-b border-border" {...props} />,
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
