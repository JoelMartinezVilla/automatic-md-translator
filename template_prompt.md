Translate the Markdown content I'll paste later into {TARGET_LANGUAGE}.


Hard rules — follow strictly:

FILE TYPE & STRUCTURE
- Only process as Markdown if the file starts with typical Markdown/front matter patterns; otherwise, output unchanged.
- Preserve the exact original structure: headings, lists, tables, blockquotes, HTML-in-Markdown, and the order of all lines.
- Preserve all original line breaks and the exact number of blank lines. Never add or remove blank lines.
- Use two spaces for indentation if you need to indent (never tabs).
- Never add content that is not a translation of existing content.

FRONT MATTER (YAML)
- Front matter exists only if the file begins with a line containing exactly `---` and is closed by another line `---` before the body.
- Always close the front matter if it was opened, using a single line with `---` before the Markdown body.
- Never add extra `---` lines anywhere else.
- Never wrap the front matter with ```yaml or any other code fence. Output it exactly as plain text between the starting and ending `---` lines.
- Do not translate keys. Translate values only.
- Do not change the order of keys/entries. Do not add or remove entries.
- Values to translate:
  - Strings (scalars) that are not URLs.
  - Strings inside arrays or objects that are not URLs.
- Values to NEVER change:
  - Any value that is a URL or URL-like reference: strings that start with `http://` or `https://`, `mailto:`, `tel:`, or that look like paths or anchors (`/...`, `./...`, `../...`, `#anchor`).
  - The eleventyNavigation.parent value.
- Lang rule:
  - If a `lang` key exists in the front matter, always replace its value with the 2-letter ISO 639-1 code of the {TARGET_LANGUAGE}.
  - Example: translating into Spanish → `lang: es`; into French → `lang: fr`.
  - Do not add `lang` if it does not exist.
- YAML safety:
  - Do not add quotes unless required to keep YAML valid (e.g., values containing `:`, `#`, leading `-`, quotes, or line breaks). If needed, use double quotes and escape internal quotes accordingly.
  - Never insert empty lines inside the front matter.

MARKDOWN BODY
- Never change the Markdown markup structure.
- Never add or remove links.
- Never modify any URL.
- Images: in `![alt](url "title")`, translate `alt` and the optional `"title"`; do not change `url`.
- Links: in `[text](url "title")`, translate `text` and the optional `"title"`; do not change `url`.
- Code:
  - Do NOT translate or modify fenced code blocks (```), including their fences and language hints.
  - Do NOT translate or modify inline code spans (enclosed in backticks).
- Keep tables, lists, and HTML blocks intact. Translate only their visible text content (not attributes that are URLs).
- Never introduce or remove horizontal rules. Do not insert `---` lines.

TERMS NOT TO TRANSLATE
- Never translate the exact phrase: `Openers & Closers` (keep it exactly as is, wherever it appears outside code).

QUALITY & CONSISTENCY
- Ensure the translation reads naturally and is consistent with surrounding sentences.
- The output must be valid Markdown and, if front matter exists, valid YAML.
- Output only the translated file content (no explanations).

Edge cases:
- If the file has no front matter, do not create one.
- If `title` is missing, do not add it.
- If detecting URLs inside arrays/objects, apply the same “do not change URL” rule.