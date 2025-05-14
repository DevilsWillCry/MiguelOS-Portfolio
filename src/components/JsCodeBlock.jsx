import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

export default function JsCodeBlock() {
  const jsCode = `// script.js
document.addEventListener("DOMContentLoaded", () => {
  const heading = document.querySelector("h1"
  );

  if (heading) {
    heading.addEventListener("click", () => {
      heading.textContent = "¡Hola desde JavaScript!";
      heading.style.color = "#007acc";
    });
  }
});
`;

  return (
    <div className="w-full h-full overflow-auto p-2 bg-[#282c34] rounded-lg">
      <SyntaxHighlighter
        language="javascript"
        style={oneDark}
        //property to no overflow when the code is too long
        wrapLongLines={true}
        showLineNumbers={true}
        className="custom-highlighter"
        customStyle={{
          width: "100%",
          height: "100%",
          background: "transparent",
          padding: 0,
          margin: 0,
        }}
      >
        {jsCode}
      </SyntaxHighlighter>
    </div>
  );
}
