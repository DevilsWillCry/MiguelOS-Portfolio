import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

export default function CssCodeBlock() {
  const cssCode = `/* style.css */
body {
  margin: 0;
  padding: 0;
  font-family: sans-serif;
  background-color: #f0f0f0;
}

h1 {
  color: #333;
  text-align: center;
  margin-top: 2rem;
}

/* Media Query para pantallas pequeñas */
@media (max-width: 768px) {
  h1 {
    font-size: 1.5rem;
    color: darkblue;
  }

  body {
    background-color: #e0e0e0;
  }
}
`;

  return (
    <div className="w-full h-full overflow-auto p-2 bg-[#282c34] rounded-lg">
      <SyntaxHighlighter
        language="css"
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
        {cssCode}
      </SyntaxHighlighter>
    </div>
  );
}
