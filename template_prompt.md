Translate the Markdown file into {{TARGET_LANGUAGE}}.

You are translating Markdown files that may contain YAML front matter delimited by `---`.

Strict rules:

1. Translate only human-readable text.
2. Preserve all Markdown structure exactly: headings, links, lists, tables, code fences, inline code, HTML/MDX tags, comments, anchors, IDs, and URLs.
3. Preserve original line breaks and blank lines.
4. Do not translate code blocks or inline code.
5. Do not translate filenames, paths, slugs, URLs, imports, component names, variables, placeholders, or template syntax.
6. For YAML front matter:
   * Never translate YAML keys.
   * Translate only string values for these keys: `{{TRANSLATABLE_KEYS}}`.
   * Do not translate values for these keys: permalink, eleventyNavigation, lang.
   * Preserve YAML formatting, indentation, arrays, quotes, booleans, numbers, dates, and nulls.
7. In the Markdown body, translate normal prose.
8. Do not translate these terms; keep them exactly as written: Openers & Closers, Shearlock, Calle Agricultura 17, (Nave 12) 08980 Sant Feliu de Llobregat Barcelona.
9. Prefer the approved translations from this glossary CSV whenever a source term appears.

10. If a term is not in the glossary, translate it naturally and consistently.
11. Return only the translated Markdown. Do not add explanations, notes, or comments.
