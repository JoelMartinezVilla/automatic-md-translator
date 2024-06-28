

# automatic-md-translator

## 📖 Description:
Automatic translation of Markdown-formatted files into the language of your choice using the [chatgpt-md-translator](https://github.com/smikitky/chatgpt-md-translator?tab=readme-ov-file) repository. The code creates a folder structure by language and generates translated copies of your ".md" files.
This can be useful if you manage website content through these types of files.

## 👨‍💻 Requirements:
- Clone this repository in your local storage.
  
- You need to install the [chatgpt-md-translator](https://github.com/smikitky/chatgpt-md-translator?tab=readme-ov-file) repository by following the steps in the provided link.
  
- Install Node.js by following the instructions in this link: [Node.js installation](https://nodejs.org/en/learn/getting-started/how-to-install-nodejs).

## 💥 Usage Method:
In the "script.js" file, you can modify the values of the `languages` variable to translate your files into those languages.

```
const fs = require("fs").promises;
const { exec } = require("child_process");
const { promisify } = require("util");
const path = require("path");
const execPromise = promisify(exec);

// Base directory where the files to translate are
const rootDir = 'origin';
const wordToReplace = 'language';

//This is what you have to change if you want to add or delete any language
const languages = ['japanese', 'spanish', 'portuguese', 'english'];
```

Place your original files that you want to translate inside the "origin" directory.
Finally, open a console, navigate to the directory where you have the "script.js" file, and execute the command `node script.js`.
A directory named "target" will be created, containing all your translated files organized into different subdirectories based on their language.

## 📝 To-Do List
- [ ] Include functionality for systems outside Linux and UNIX.
- [ ] Change the language format to it's code.
- [ ] Add a settings file to manage the base directory and the output directory.
- [ ] Improve the speed of the script.

