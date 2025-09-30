const fs = require("fs").promises;
const { exec } = require("child_process");
const { promisify } = require("util");
const path = require("path");
const execPromise = promisify(exec);
const { encoding_for_model } = require("tiktoken");


const MODEL = "gpt-4o";  
const INPUT_PRICE_PER_MTOK  = 2.5;
const OUTPUT_PRICE_PER_MTOK = 10.0; 
const enc = encoding_for_model(MODEL);

const rootDir = './target/';
const outputPath = './dest/';
const wordToReplace = '{TARGET_LANGUAGE}';
const languages = { 'en': 'english', "it": "italian" };
let lastLang = "";

let grandInputTokens = 0;
let grandOutputTokens = 0;
let grandInputCost = 0;
let grandOutputCost = 0;

async function main() {
  try { await fs.unlink('prompt.md'); } catch {}
  await fs.copyFile('template_prompt.md', 'prompt.md');

  let i = -1;
  for (let code of Object.keys(languages)) {
    const lang = languages[code];
    i++;
    await walkAndProcess(rootDir, code, lang, i === 0);
    lastLang = lang;
  }

  const totalCost = grandInputCost + grandOutputCost;
  console.log("\n================= RESUMEN TOTAL =================");
  console.log(`Modelo: ${MODEL}`);
  console.log(`Tokens entrada totales : ${grandInputTokens}`);
  console.log(`Tokens salida totales  : ${grandOutputTokens}`);
  console.log(`Coste entrada total    : $${grandInputCost.toFixed(6)}`);
  console.log(`Coste salida total     : $${grandOutputCost.toFixed(6)}`);
  console.log(`-----------------------------------------------`);
  console.log(`COSTE TOTAL            : $${totalCost.toFixed(6)}`);
  console.log("================================================\n");

  enc.free();
}

async function walkAndProcess(currentDir, code, lang, isFirstLanguage) {
  const entries = await fs.readdir(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcEntryPath = path.join(currentDir, entry.name);
    const relPath = path.relative(rootDir, srcEntryPath);
    const destEntryPath = path.join(outputPath, relPath);
    const destFilePath = destEntryPath.replace(entry.name, `${code}.md`);

    if (entry.isDirectory()) {
      await fs.mkdir(destEntryPath, { recursive: true });
      await walkAndProcess(srcEntryPath, code, lang, isFirstLanguage);
      continue;
    }

    await fs.mkdir(path.dirname(destFilePath), { recursive: true });

    if (!entry.name.endsWith(".md")) {
      await fs.copyFile(srcEntryPath, destEntryPath);
      continue;
    }

    console.log("[*] Translating " + entry.name + " to " + lang);

    let promptText = await fs.readFile('prompt.md', 'utf8');
    const fromStr = isFirstLanguage ? wordToReplace : lastLang;
    promptText = promptText.replaceAll(fromStr, lang);

    const srcMd = await fs.readFile(srcEntryPath, 'utf8');

    const inputTokens =
      enc.encode(promptText).length +
      enc.encode(srcMd).length;

    const inputCost = (inputTokens * INPUT_PRICE_PER_MTOK) / 1_000_000;

    grandInputTokens += inputTokens;
    grandInputCost += inputCost;

    console.log(`[simple] inputTokens=${inputTokens} | estInputCost=$${inputCost.toFixed(6)}`);

    const sedCmd = isFirstLanguage
      ? `sed -i "s/${escapeSed(fromStr)}/${escapeSed(lang)}/g" prompt.md`
      : `sed -i "s/${escapeSed(lastLang)}/${escapeSed(lang)}/g" prompt.md`;

    try {
      const { stdout, stderr } = await execPromise(
        `${sedCmd} && chatgpt-md-translator -o "${destFilePath}" "${srcEntryPath}"`
      );
      if (stderr) console.log(stdout + " " + stderr);
      else console.log(stdout);
      console.log("OK " + entry.name + " -> " + lang + "\n");
    } catch (error) {
      console.error('Error executing command:', error);
      continue;
    }

    try {
      const outText = await fs.readFile(destFilePath, 'utf8');
      const outputTokens = enc.encode(outText).length;
      const outputCost = (outputTokens * OUTPUT_PRICE_PER_MTOK) / 1_000_000;

      grandOutputTokens += outputTokens;
      grandOutputCost += outputCost;

      const totalThisFile = inputCost + outputCost;
      console.log(
        `[simple] outputTokens=${outputTokens} | estOutputCost=$${outputCost.toFixed(6)} | estTOTAL_archivo=$${totalThisFile.toFixed(6)}`
      );
    } catch {
      console.log(`[simple] (sin salida legible, solo se suma la entrada)`);
    }
  }
}

function escapeSed(str) {
  return String(str).replace(/[\/&]/g, '\\$&');
}

main().catch(err => console.error(err));
