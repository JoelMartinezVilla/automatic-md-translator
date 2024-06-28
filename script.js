const fs = require("fs").promises;
const { exec } = require("child_process");
const { promisify } = require("util");
const path = require("path");
const execPromise = promisify(exec);

// Base directory where the files to translate are
const rootDir = 'origin';
const wordToReplace = 'language';

const languages = ['japanese', 'spanish', 'portuguese', 'english'];

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

    // Main loop over the languages
    for (let i = 0; i < languages.length; i++) {
        let lang = languages[i];
        
        try {
            // Loop inside of the directory 
            const dirs = await fs.readdir(rootDir);
            for (const dir of dirs) {
                const dirPath = path.join(rootDir, dir);
                try {
                    const files = await fs.readdir(dirPath);
                    // Loop over the files inside each directory
                    for (const file of files) {

                        // Create the path to the file
                        const srcFilePath = path.join(dirPath, file);
                        const destDirPath = path.join('target', lang);
                        const destSubDirPath = path.join(destDirPath, dir);
                        const destFilePath = path.join(destSubDirPath, file);

                        await fs.mkdir(destSubDirPath, { recursive: true });

                        if (file.endsWith(".md")) {
                            console.log("[*]Translating "+file+" to "+lang);
                            // Translate the .md file
                            if (i==0) {
                                // In case the language is the first change the wordToReplace
                                try {
                                    await execPromise(`sed -i "s/${wordToReplace}/${lang}/g" prompt.md && chatgpt-md-translator -o "${destFilePath}" "${srcFilePath}"`);
                                    console.log("File "+file+" translated successfully to "+lang+"\n");
                                } catch (error) {
                                    console.error('Error when executing the command:', error);
                                    continue;
                                }
                            } else {
                                // If the language is not the first, change the last language
                                try {
                                    await execPromise(`sed -i "s/${languages[i - 1]}/${lang}/g" prompt.md && chatgpt-md-translator -o "${destFilePath}" "${srcFilePath}"`);
                                    console.log("File "+file+" translated successfully to "+lang);
                                } catch (error) {
                                    console.error('Error when executing the command:', error);
                                    continue;
                                }
                            }
                        } else {
                            // Copy the file if it is not a .md
                            try {
                                await fs.copyFile(srcFilePath, destFilePath);
                                console.log('File '+file+' duplicated successfully.');
                            } catch (err) {
                                console.error('Error when duplicating the file:', err);
                            }
                        }
                    }
                } catch (err) {
                    console.error('Error reading the directory:', err);
                }
            }
        } catch (err) {
            console.error('Error reading the directory:', err);
        }
    }
}

// Call to the main function
main().catch(err => console.error(err));
