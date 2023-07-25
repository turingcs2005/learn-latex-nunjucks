## File structure and "order of operations"

LaTeX and Nunjucks stack combined, file structure, common issues

*This section needs a fair amount of edits, but I'm pushing the existing version since I think there's still some helpful information*

### File Structure
Here's an overview of how the file structure works:

```
src
	app.mts
	tools
		converters.mts
		node-latex.mts
projects
	my-project
		helpers.njk
		main.njk
		preamble.tex
		sections
			MySection.tex
```


**converters.mts** 
Functions to convert things, Nunjucks config, match previous descript

**node-latex.mts**
Actually compile tex

**helpers.njk**
Functions in nunjucks to help, imported into main.njk

**main.njk**
contains the series of nunjucks and LaTeX commands that should render the entire project PDF. This includes inputting the sections defined in the sections directory.

**preamble.tex**
Preamble for tex

**sections/MySection.tex**
Single tex section, won't run on its own, stores "bulk" text. None of the .tex files in *sections/* will compile on their own because they are missing the beginning and end commands and preamble since they are intended to be inserted into a larger document. These files are only separated for code clarity and encapsulation-- they could all be in the same file if desired. Do not use nunjucks commands or variables in a .tex file!

### Order of operations
Once again note that Nunjucks is only operating on a text level and does not "know" anything about LaTeX. Rendering a nunjucks file will not execute any LaTeX commands.

##### Example: Acceptable Nunjucks function
```
[## macro BoringSection() ##]
\newpage
\textbf{This is my section.}
[## endmacro ##]
```

Calling the function BoringSection() in your Nunjucks file simply replaces the call `BoringSection()` with the text:
```
\newpage
\textbf{This is my section.}
```

Additionally, this means you *cannot* use Nunjucks variables inside of the .tex files location in the sections directory. Most of the time, this isn't necessary. Headers/footers/titles/tables can be handled in nunjucks (see *BasicPage* and *PlainPage* functions in helpers.njk) and the .tex files in the sections directory should mostly just be body text. However, there are exceptions and work arounds.

##### Example: Vessel clauses option
One of three options must be selected for the vessel clause. In order to keep this section as its own tex file, we can define a LaTeX variable in the .tex and set it in nunjucks.

In other situations, a Nunjucks function can be created to render the section/figure and that can be called on the variables within the main nunjucks file.

Additionally, Nunjucks macros as called by inserting them into a variable. This is another area to be careful of side effects and errors.

### Escaping characters
TODO: texscape filter

In normal LaTeX, the following characters need to be escaped (this is not all of them):
Character           Command to use in text
&                   \&
%                   \%
\                   \textbackslash

Within Nunjucks, you can use "normal" LaTeX **except inside of Nunjucks variables.**

```
env.addFilter('texscape', function(str) {
    const fixslash = str.replace(/\\/g, "\\textbackslash");
    const fixsymbols = fixslash.replace(/(\$|%|&|#|_|\{|\})/g, "\\$1"); // replace tex special characters
    const fixspecial = fixsymbols.replace(/(\^|~)/g, "\\$1\{\}") // replace tex special characters with a different replacement syntax
    return fixspecial;
});
```









