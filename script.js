const fs = require("fs").promises;
const { exec } = require("child_process");
const { promisify } = require("util");
const path = require("path");
const execPromise = promisify(exec);

// Base directory where the files to translate are
const rootDir = './target/';
const outputPath = './dest/';

const wordToReplace = '{TARGET_LANGUAGE}';

//This is what you have to change if you want to add or delete any language
const languages = { 'en': 'english', "it": "italian" };

let lastLang = "";

async function main() {

    // Detele the old prompt in case there is one
    try {
        await fs.unlink('prompt.md');
        console.log('Prompt deleted successfully.');
    } catch (err) {
        console.error('Error when deleting the prompt:', err);
    }

    // Create a new prompt from the template
    try {
        await fs.copyFile('template_prompt.md', 'prompt.md');
        console.log('Template prompt duplicated successfully.');
    } catch (err) {
        console.error('Error when duplicating the prompt:', err);
    }

    let i = -1;
    // Main loop over the languages
    for (let code of Object.keys(languages)) {
        console.log(code);
        console.log(languages[code]);

        let lang = languages[code];
        i++;

        try {
            // Recursively process everything under rootDir
            await walkAndProcess(rootDir, code, lang, i === 0);
        } catch (err) {
            console.error('Error reading the directory:', err);
        }

        lastLang = lang;
    }
}


async function walkAndProcess(currentDir, code, lang, isFirstLanguage) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
        const srcEntryPath = path.join(currentDir, entry.name);
        // Path relative to rootDir so we can mirror it in dest
        const relPath = path.relative(rootDir, srcEntryPath);
        const destEntryPath = path.join(outputPath, relPath);
        const destFilePath = destEntryPath.replace(entry.name, `${code}.md`)

        if (entry.isDirectory()) {
            // Ensure destination directory exists, then recurse
            try {
                await fs.mkdir(destEntryPath, { recursive: true });
            } catch (err) {
                console.error('Error when creating destination directory:', err);
            }
            await walkAndProcess(srcEntryPath, code, lang, isFirstLanguage);
        } else {
            // Ensure the parent folder exists for files
            try {
                await fs.mkdir(path.dirname(destFilePath), { recursive: true });
            } catch (err) {
                console.error('Error when creating destination subdirectory:', err);
            }

            if (entry.name.endsWith(".md")) {
                console.log("[*]Translating " + entry.name + " to " + lang);

                // Keep original behavior for prompt replacements
                const sedCmd = isFirstLanguage
                    ? `sed -i "s/${wordToReplace}/${lang}/g" prompt.md`
                    : `sed -i "s/${lastLang}/${lang}/g" prompt.md`;

                try {
                    const { stdout, stderr } = await execPromise(
                        `${sedCmd} && chatgpt-md-translator -o "${destFilePath}" "${srcEntryPath}"`
                    );
                    if (stderr) {
                        console.log(stdout + " " + stderr);
                    } else {
                        console.log(stdout);
                    }
                    console.log("File " + entry.name + " translated successfully to " + lang + "\n");
                } catch (error) {
                    console.error('Error when executing the command:', error);
                    continue;
                }
            } else {
                // Copy the file if it is not a .md
                try {
                    await fs.copyFile(srcEntryPath, destEntryPath);
                    console.log('File ' + entry.name + ' duplicated successfully.');
                } catch (err) {
                    console.error('Error when duplicating the file:', err);
                }
            }
        }
    }
}

// Call to the main function
main().catch(err => console.error(err));
