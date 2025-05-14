import React, { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

export default function DescriptionProjectDesktop({ content, isOn }) {
  console.log(content);

  return (
    <div className="prose prose-invert w-full h-full  p-3 text-[0.8rem] text-wrap">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <SyntaxHighlighter
                {...props}
                style={oneDark}
                language={match[1]}
                PreTag="div"
                wrapLongLines={true}
                showLineNumbers={true}
                customStyle={{
                  width: "100%",
                  height: "100%",
                  padding: 0,
                  margin: 0,
                  whiteSpace: "pre-wrap", 
                  overflow: "auto",
                  wordBreak: "break-word",
                }}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code {...props} className={className}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
