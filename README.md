

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
const rootDir = './target/';
const outputPath = './dest/';

const wordToReplace = '{TARGET_LANGUAGE}';

//This is what you have to change if you want to add or delete any language
const languages = { 'en': 'english', "it": "italian" };
```

Place your original files that you want to translate inside the "target" directory.
Finally, open a console, navigate to the directory where you have the "script.js" file, and execute the command `node script.js`.
A directory named "dest" will be created, containing all your translated files organized into different subdirectories based on their language.

### Example

Let's say we're going to translate a folder named "files" that contains three files: "1.md", "2.md" and "3.yaml".
The first step to translating the files would be to copy and paste the folder with its content into the folder "target" inside the repo.

It should look somewhat like this
```js
── automatic-md-translator/
 ├── target/
 │ └── files/
 │   └── 1.md
 │   └── 2.md
 │   └── 3.yaml
 ├── script.js
 ├── ... some other files
```
Then we will look for the variable languages inside the script.js and add the languages we sant with this key: value format: {"es": "spanish", ... other languages}.
Now all we have to do is call the script with "node script.js" with a console in the root of the repo and you will have the same structure as before but with the name of the language translated to. Like this: 
```js
── automatic-md-translator/
 ├── target/
 │ └── files/
 │   └── es.md
 │   └── es.md
 │   └── 3.yaml
 ├── script.js
 ├── ... some other files
```

## 📝 To-Do List
- [ ] Include functionality for systems outside Linux and UNIX.
- [ ] Change the language format to it's code.
- [ ] Add a settings file to manage the base directory and the output directory.
- [ ] Improve the speed of the script.

