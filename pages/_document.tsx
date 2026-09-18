import { Html, Head, Main, NextScript } from "next/document";

// A custom document purely to declare the language: CSS `hyphens: auto` only
// kicks in when the browser knows which language's hyphenation rules to use,
// and justified text needs hyphenation to avoid gaping word spaces.
export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
