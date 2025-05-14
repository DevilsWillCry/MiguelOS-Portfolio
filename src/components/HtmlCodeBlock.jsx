import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

export default function HtmlCodeBlock() {
  const htmlCode = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=
    device-width, initial-scale=1.0" />
    <title>Mi Proyecto</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <h1>Hola Mundo</h1>
    <script src="script.js"></script>
  </body>
</html>`;

  return (
    <div className="w-full h-full overflow-auto p-2 bg-[#282c34] rounded-lg">
      <SyntaxHighlighter
        language="html"
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
        {htmlCode}
      </SyntaxHighlighter>
    </div>
  );
}
