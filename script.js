const fs = require("fs").promises;
const { exec } = require("child_process");
const { promisify } = require("util");
const path = require("path");
const execPromise = promisify(exec);
const { encoding_for_model } = require("tiktoken");

const RATE_LIMIT_TOKENS = 160_000;
const RATE_LIMIT_WAIT_MS = 60_000;

let minuteWindowTokens = 0;
let minuteWindowStartedAt = Date.now();

const MODEL = "gpt-4o";
const INPUT_PRICE_PER_MTOK = 0.20;
const OUTPUT_PRICE_PER_MTOK = 1.25;
const enc = encoding_for_model(MODEL);

const rootDir = '../legal/src/content/it/legal';
const outputPath = '../../../Escritorio/leagal-it/';
// const rootDir = '../opcl-website/src/content/products/';
// const outputPath = '../opcl-website/src/content/products/';
const wordToReplace = '{TARGET_LANGUAGE}';
const languages = { "it": "italian" };
const limitSpending = 1.50;
let lastLang = "";
let stopProcessing = false;

let grandInputTokens = 0;
let grandOutputTokens = 0;
let grandInputCost = 0;
let grandOutputCost = 0;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function waitIfTokenLimitWouldBeHit(nextTokens) {
  const elapsed = Date.now() - minuteWindowStartedAt;

  if (elapsed >= RATE_LIMIT_WAIT_MS) {
    minuteWindowTokens = 0;
    minuteWindowStartedAt = Date.now();
  }

  if (minuteWindowTokens + nextTokens >= RATE_LIMIT_TOKENS) {
    console.log(`[rate-limit] Reached ~${minuteWindowTokens} tokens this minute. Waiting 60s...`);
    await sleep(RATE_LIMIT_WAIT_MS);

    minuteWindowTokens = 0;
    minuteWindowStartedAt = Date.now();
  }

  minuteWindowTokens += nextTokens;
}

function isRateLimitError(error) {
  const text = [
    error?.message,
    error?.stderr,
    error?.stdout,
    String(error)
  ].join(" ").toLowerCase();

  return (
    text.includes("rate limit") ||
    text.includes("rate_limit") ||
    text.includes("tokens per min") ||
    text.includes("tpm") ||
    text.includes("429")
  );
}

async function main() {
  try { await fs.unlink('prompt.md'); } catch { }
  await fs.copyFile('template_prompt.md', 'prompt.md');

  let i = -1;
  for (let code of Object.keys(languages)) {
    if (stopProcessing) {
      return;
    }
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
    const destFilePath = destEntryPath;

    // const destFilePath = destEntryPath.replace(entry.name, `${code}.md`);

    if (entry.isDirectory()) {
      await fs.mkdir(destEntryPath, { recursive: true });
      await walkAndProcess(srcEntryPath, code, lang, isFirstLanguage);
      continue;
    }

    await fs.mkdir(path.dirname(destFilePath), { recursive: true });

    // if (entry.name != "es.md") {
    //   // await fs.copyFile(srcEntryPath, destEntryPath);
    //   continue;
    // }

    if (!entry.name.endsWith(".md")) {
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

    if (typeof limitSpending != "undefined" && (grandInputCost + grandOutputCost + inputCost) >= limitSpending) {
      console.error("Reached spending limit of:" + limitSpending);
      stopProcessing = true;
      return;
    }

    grandInputTokens += inputTokens;
    grandInputCost += inputCost;

    console.log(`[simple] inputTokens=${inputTokens} | estInputCost=$${inputCost.toFixed(6)}`);

    const sedCmd = isFirstLanguage
      ? `sed -i "s/${escapeSed(fromStr)}/${escapeSed(lang)}/g" prompt.md`
      : `sed -i "s/${escapeSed(lastLang)}/${escapeSed(lang)}/g" prompt.md`;

    while (true) {
      try {
        await waitIfTokenLimitWouldBeHit(inputTokens);

        const { stdout, stderr } = await execPromise(
          `${sedCmd} && chatgpt-md-translator -o "${destFilePath}" "${srcEntryPath}"`
        );

        if (stderr) console.log(stdout + " " + stderr);
        else console.log(stdout);

        console.log("OK " + entry.name + " -> " + lang + "\n");

        break; // success
      } catch (error) {
        if (isRateLimitError(error)) {
          console.log(
            "[rate-limit] API limit reached. Waiting 60s before retrying same file..."
          );

          await sleep(60_000);
          continue;
        }

        throw error; // actual error, stop script
      }
    }

    try {
      const outText = await fs.readFile(destFilePath, 'utf8');
      const outputTokens = enc.encode(outText).length;
      const outputCost = (outputTokens * OUTPUT_PRICE_PER_MTOK) / 1_000_000;

      grandOutputTokens += outputTokens;
      grandOutputCost += outputCost;

      const totalThisFile = inputCost + outputCost;
      console.log(
        `[simple] outputTokens=${outputTokens} | estOutputCost=$${outputCost.toFixed(6)} | estTOTAL_archivo=$${totalThisFile.toFixed(6)}`+`\n totalTokens=${grandOutputTokens+grandInputTokens} | estTotalCost=$${grandInputCost+grandOutputCost}`
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
