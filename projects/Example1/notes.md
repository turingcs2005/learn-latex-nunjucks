## Introduction to LaTeX

This example focuses on just LaTeX, no Nunjucks. I recommend becoming familiar with LaTeX before beginning Nunjucks.

See `guide.pdf` in this folder for a write up on LaTeX

You can also go to `tex-files/Example1` to see the .tex file used to generate the guide. There's also a file called `demo.tex`, which demonstrates much of the formatting needed for PDF generation.

#### Example

Try running the following in `src/app.mts`:

```
import { TexToPDF } from './tools/converters.mjs';
TexToPDF('Example1/demo.tex', 'demo.pdf');
```

(To run the application, run `npm run build` and then `npm run start`)