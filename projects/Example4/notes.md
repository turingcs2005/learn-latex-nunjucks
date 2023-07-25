## Common issues

*This section is also in progress*

### Imports, inputs, includes, etc

**Importing other tex files does not occur until the tex is compiled**
There are a variety of ways to import/include/input things in both Nunjucks and LaTeX. This project uses 
`\input(filepath)` in LaTeX. This is essentially equivalent to copying and pasting the contents of the file into the location where it's called. Other LaTeX import methods exist but may cause unexpected side effects. **Nunjucks will treat these inputs as only plaintext and will not input anything. The input happens at compile time for the resulting tex**

Nunjucks also has multiple options. This project uses `from [file] import [functions]`. Nunjucks `include` will render the included file *before* inserting it. Also, be careful with variable scoping. See the Nunjucks documentation for more details.

### Trouble Shooting
**Nunjucks errors are very likely caused by either syntax typos or issues with variable syntax**. These issues include escape issues or incorrectly indicating whether something is a variable (using the #! !# tags).

**Tips**
- Add or remove #! !# tags in Nunjucks
- Check for typos in tags (such as !# #! instead of #! !#)
- Check if the `texscape` filter needs to be added or removed
- Try saving the tex file if the PDF isn't rendering
- Check where and how the tex file is being compiled (eg pdflatex vs lualatex)
- Check scoping and that no Nunjucks is present in tex files
- Check that any tex files include the packages needed (in the preamble) and \begin{document} and \end{document}
- Try running the LaTeX in Overleaf, which is very helpful for figuring out LaTeX issues without calling Nunjucks repeatedly. Overleaf also has generally helpful error dscriptions (make sure to include the preamble!)
- Don't worry about LaTeX "warnings", such as "hbox overflow", "badbox", etc. These usually just mean that something is inefficient or not ideal but won't necessarily prevent the document from displaying properly. It's sort of similar to an "import not used" warning.