

# automatic-md-translator

## 📖 Description:
Automatic translation of Markdown-formatted files into the language of your choice using the [chatgpt-md-translator](https://github.com/smikitky/chatgpt-md-translator?tab=readme-ov-file) repository. The code creates a folder structure by language and generates translated copies of your ".md" files.
This can be useful if you manage website content through these types of files.

## 👨‍💻 Requirements:
- You need to install the [chatgpt-md-translator](https://github.com/smikitky/chatgpt-md-translator?tab=readme-ov-file) repository by following the steps in the provided link.
  
- Install Node.js by following the instructions in this link: [Node.js installation](https://nodejs.org/en/learn/getting-started/how-to-install-nodejs).

## 💥 Usage Method:
In the "script.js" file, you can modify the values of the `languages` variable to translate your files into those languages.

![image of variable language](https://i.pinimg.com/originals/59/b0/a4/59b0a47b6f319c1148d1b4268ed38311.png)

Place your original files that you want to translate inside the "origin" directory.
Finally, open a console, navigate to the directory where you have the "script.js" file, and execute the command `node script.js`.
A directory named "target" will be created, containing all your translated files organized into different subdirectories based on their language.

## 📝 To-Do List
- [ ] Change the language format to it's code.
- [ ] Add a settings file to manage the base directory and the output directory.
- [ ] Improve the speed of the script.

