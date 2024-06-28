const fs = require("fs").promises;
const { exec } = require("child_process");
const { promisify } = require("util");
const path = require("path");

const execPromise = promisify(exec);

const rootDir = 'origin';
const wordToReplace = 'language';

const languages = ['japanese', 'spanish', 'portuguese', 'english'];

async function main() {
    try {
        await fs.unlink('prompt.md');
        console.log('Archivo eliminado con éxito.');
    } catch (err) {
        console.error('Error al eliminar el archivo:', err);
    }

    try {
        await fs.copyFile('template_prompt.md', 'prompt.md');
        console.log('Archivo duplicado con éxito.');
    } catch (err) {
        console.error('Error al duplicar el archivo:', err);
    }

    // Bucle principal
    for (let i = 0; i < languages.length; i++) {
        let lang = languages[i];
        console.log("I " + i + " " + lang);

        try {
            const dirs = await fs.readdir(rootDir);
            for (const dir of dirs) {
                const dirPath = path.join(rootDir, dir);
                try {
                    const files = await fs.readdir(dirPath);
                    for (const file of files) {
                        console.log(file);
                        const srcFilePath = path.join(dirPath, file);
                        const destDirPath = path.join('target', lang);
                        const destSubDirPath = path.join(destDirPath, dir);
                        const destFilePath = path.join(destSubDirPath, file);

                        //console.log(srcFilePath);

                        await fs.mkdir(destSubDirPath, { recursive: true });

                        if (file.endsWith(".md")) {
                            
                            if (lang == 'japanese') {
                                console.log(`sed -i --debug "s/${wordToReplace}/${lang}/g" prompt.md`);
                                try {
                                    await execPromise(`sed -i --debug "s/${wordToReplace}/${lang}/g" prompt.md && chatgpt-md-translator -o "${destFilePath}" "${srcFilePath}"`);
                                } catch (error) {
                                    console.error('Error al ejecutar el comando:', error);
                                    continue;
                                }
                            } else {
                                try {
                                    await execPromise(`sed -i --debug "s/${languages[i - 1]}/${lang}/g" prompt.md && chatgpt-md-translator -o "${destFilePath}" "${srcFilePath}"`);
                                } catch (error) {
                                    console.error('Error al ejecutar el comando:', error);
                                    continue;
                                }
                            }
                        } else {
                            try {
                                await fs.copyFile(srcFilePath, destFilePath);
                                console.log('Archivo duplicado con éxito.');
                            } catch (err) {
                                console.error('Error al duplicar el archivo:', err);
                            }
                        }
                    }
                } catch (err) {
                    console.error('Error al leer el directorio:', err);
                }
            }
        } catch (err) {
            console.error('Error al leer el directorio:', err);
        }
    }
}

main().catch(err => console.error(err));
