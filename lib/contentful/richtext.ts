/**
 * Bidirectional converter: Contentful rich-text ↔ plain Markdown.
 *
 * Supported in editor textarea:
 *   # Heading 1   ## Heading 2   ### Heading 3
 *   **bold**   *italic*   `code`
 *   - bullet lists   > blockquote   --- (hr)
 *   Paragraphs separated by blank lines
 */

// ─── Rich-text → Markdown ────────────────────────────────────────────────────

export function richTextToMarkdown(doc: any): string {
  if (!doc?.content) return "";
  return doc.content
    .map((n: any) => blockToMd(n))
    .filter(Boolean)
    .join("\n\n");
}

function blockToMd(node: any): string {
  switch (node.nodeType) {
    case "heading-1":
      return `# ${inlinesToMd(node.content)}`;
    case "heading-2":
      return `## ${inlinesToMd(node.content)}`;
    case "heading-3":
      return `### ${inlinesToMd(node.content)}`;
    case "paragraph":
      return inlinesToMd(node.content);
    case "blockquote":
      return (node.content || []).map((n: any) => `> ${blockToMd(n)}`).join("\n");
    case "hr":
      return "---";
    case "unordered-list":
      return (node.content || [])
        .map((li: any) => `- ${inlinesToMd(li.content?.[0]?.content || [])}`)
        .join("\n");
    case "ordered-list":
      return (node.content || [])
        .map(
          (li: any, i: number) =>
            `${i + 1}. ${inlinesToMd(li.content?.[0]?.content || [])}`
        )
        .join("\n");
    default:
      return "";
  }
}

function inlinesToMd(nodes: any[]): string {
  return (nodes || [])
    .map((n: any) => {
      if (n.nodeType !== "text") return "";
      let v = n.value ?? "";
      const marks: string[] = (n.marks || []).map((m: any) => m.type);
      if (marks.includes("bold")) v = `**${v}**`;
      if (marks.includes("italic")) v = `*${v}*`;
      if (marks.includes("code")) v = `\`${v}\``;
      return v;
    })
    .join("");
}

// ─── Markdown → Rich-text ────────────────────────────────────────────────────

export function markdownToRichText(md: string): any {
  const lines = md.split("\n");
  const blocks: any[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (/^# /.test(line)) {
      blocks.push(heading(1, line.slice(2)));
    } else if (/^## /.test(line)) {
      blocks.push(heading(2, line.slice(3)));
    } else if (/^### /.test(line)) {
      blocks.push(heading(3, line.slice(4)));
    } else if (/^> /.test(line)) {
      blocks.push(blockquote(line.slice(2)));
    } else if (line.trim() === "---") {
      blocks.push({ nodeType: "hr", data: {}, content: [] });
    } else if (/^- /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^- /.test(lines[i])) {
        items.push(lines[i].slice(2));
        i++;
      }
      blocks.push(ulList(items));
      continue;
    } else if (line.trim() !== "") {
      // Paragraph — collect until blank line
      const chunk: string[] = [];
      while (i < lines.length && lines[i].trim() !== "") {
        chunk.push(lines[i]);
        i++;
      }
      const text = chunk.join(" ");
      if (text.trim()) blocks.push(para(text));
      continue;
    }

    i++;
  }

  return {
    nodeType: "document",
    data: {},
    content: blocks.length ? blocks : [para("")],
  };
}

// ─── Node builders ───────────────────────────────────────────────────────────

function para(text: string): any {
  return { nodeType: "paragraph", data: {}, content: parseInline(text) };
}

function heading(level: number, text: string): any {
  return {
    nodeType: `heading-${level}`,
    data: {},
    content: parseInline(text),
  };
}

function blockquote(text: string): any {
  return { nodeType: "blockquote", data: {}, content: [para(text)] };
}

function ulList(items: string[]): any {
  return {
    nodeType: "unordered-list",
    data: {},
    content: items.map((item) => ({
      nodeType: "list-item",
      data: {},
      content: [para(item)],
    })),
  };
}

function parseInline(text: string): any[] {
  const nodes: any[] = [];
  const re = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|([^*`]+))/g;
  let m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    if (m[2] !== undefined) nodes.push(txt(m[2], ["bold"]));
    else if (m[3] !== undefined) nodes.push(txt(m[3], ["italic"]));
    else if (m[4] !== undefined) nodes.push(txt(m[4], ["code"]));
    else if (m[5] !== undefined) nodes.push(txt(m[5], []));
  }

  return nodes.length ? nodes : [txt(text, [])];
}

function txt(value: string, marks: string[]): any {
  return {
    nodeType: "text",
    value,
    marks: marks.map((t) => ({ type: t })),
    data: {},
  };
}
