import { NjkToTex, NjkToPDF, TexToPDF, consolidateTex, nunjucks } from './tools/converters.mjs';
import fs from 'fs';
import path from "path";


/* Functions:
    nunjucks.render(file.njk, data[as object])
        Returns string output of Nunjucks rendering

    TexToPDF(inputname.tex, outputname.pdf)
        Can override input paths for compilation in config

    NjkToPDF(file.njk, outputname.pdf, data[as object], config[as object, optional])
        Compiles to PDF, option to also save tex if config {save_tex: true}
        Can override input paths for compilation in config

    NjkToTex(file.njk, outputname.tex, data[as object])

    consolidateTex(inputname.tex, outputname.tex, refdir)
        Copies in any \input references into a single tex doc, \inputs should be rel to ref directory
*/


// See the notes in the examples for sample code