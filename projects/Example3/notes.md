LaTeX and Nunjucks Stack combined, file structure, common issues

**texscape** filter: TODO

**Trouble Shooting Tips**
- Add or remove #! !# tags in Nunjucks
- Check for typos in tags (such as !# #! instead of #! !#)
- Check escapes or if safe mode should be used for specific variables
- Use LaTeX *verbatim* environment, which will return the content without actually applying any LaTeX commands (I'm also working on setting up an option to return the tex file created without running it, to identify if errors are from the Nunjucks render or LaTeX compile)
- Check where and how the tex file is being compiled (eg pdflatex vs lualatex)
- Check scoping and that no Nunjucks is present in tex files
- Check that any tex files include the packages needed (in the preamble) and \begin{document} and \end{document}
- Try running the LaTeX in Overleaf, which is very helpful for figuring out LaTeX issues without calling Nunjucks repeatedly. Overleaf also has generally error dscriptions (make sure to include the preamble!)
- Don't worry about LaTeX "warnings", such as "hbox overflow", "badbox", etc. These usually just mean that something is inefficient or not ideal but won't necessarily prevent the document from displaying properly. It's sort of similar to an "import not used" warning.

**LaTeX and Nunjucks file structure and "Order of operations"**

(Part of the) file structure:
	|     |--projects (Nunjucks and Tex files)
	|     |     |
	|     |     |
	|     |     |--my-project 
	|     |           |
	|     |           |--helpers.njk (nunjucks functions)
	|     |           |
	|     |           |--main.njk (nunjucks "directions" for entire project)
	|     |           |
	|     |           |--preview.njk (nunjucks "directions", may be used to test smaller sections)
	|     |           |
	|     |           |--preamble.tex (package imports and custom LaTeX functions)
	|     |           |
	|     |           |--sections
	|     |                 |
	|     |                 |
	|     |                 |-- MySection.tex (these will NOT compile on their own)



The custom syntax for Nunjucks is declared in converters.mts when Nunjucks is configured.

With the current file structure, nunjucks functions are stored in helpers.njk
These can be imported into other nunjucks files (NOT into .tex files)
**Do not use nunjucks commands or variables in a .tex file**

main.njk contains the series of nunjucks and LaTeX commands that should render the entire project PDF. This includes inputting the sections defined in the sections directory. preview.njk is intended to be used to test smaller pieces of nunjucks code, such as a single section

**None of the .tex files in *sections/* will compile on their own because they are missing the beginning and end commands and preamble since they are intended to be inserted into a larger document.** These files are only separated for code clarity and encapsulation-- they could all be in the same file if desired.

If main.njk is the input to makePDF(), nunjucks will render the LaTeX as directed. Nunjucks is only operating on a text level and does not "know" anything about LaTeX. Rendering a nunjucks file will not execute any LaTeX commands.

**Imports, inputs, includes, etc**

**Importing other tex files does not occur until the tex is compiled**
There are a variety of ways to import/include/input things in both Nunjucks and LaTeX. This project uses 
`\input(filepath)` in LaTeX. This is essentially equivalent to copying and pasting the contents of the file into the location where it's called. Other LaTeX import methods exist but may cause unexpected side effects. **Nunjucks will treat these inputs as only plaintext and will not input anything. The input happens at compile time for the resulting tex**

Nunjucks also has multiple options. This project uses `from [file] import [functions]`. Nunjucks `include` will render the included file *before* inserting it. Also, be careful with variable scoping. See the Nunjucks documentation for more details.

Additionally, this means you *cannot* use Nunjucks variables inside of the .tex files location in the sections directory. Most of the time, this isn't necessary. Headers/footers/titles/tables can be handled in nunjucks (see *BasicPage* and *PlainPage* functions in helpers.njk) and the .tex files in the sections directory should mostly just be body text. However, there are exceptions and work arounds.

Example: Vessel clauses option
One of three options must be selected for the vessel clause. In order to keep this section as its own tex file, we can define a LaTeX variable in the .tex and set it in nunjucks.

In other situations, a Nunjucks function can be created to render the section/figure and that can be called on the variables within the main nunjucks file.

**Escaping Characters**

In normal LaTeX, the following characters need to be escaped (this is not all of them):
Character           Command to use in text
&                   \&
%                   \%
\                   \textbackslash

Within Nunjucks, you can use "normal" LaTeX **except inside of Nunjucks variables.**

Example: Acceptable Nunjucks function
[## macro BoringSection() ##]
\newpage
\textbf{This is my section.}
[## endmacro ##]

Calling the function BoringSection() in your Nunjucks file simply replaces the call BoringSection() with the text:
\newpage
\textbf{This is my section.}

However, if you're using Nunjucks variables then the content might be escaped. (See https://mozilla.github.io/nunjucks/templating.html#safe)

Additionally, Nunjucks macros as called by inserting them into a variable. This is another area to be careful of side effects and errors.

**Nunjucks errors are very likely caused by either syntax typos or issues with variable syntax**. These issues include escape issues or incorrectly indicating whether something is a variable (using the #! !# tags).











