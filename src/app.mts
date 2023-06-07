import { NjkToTex, NjkToPDF, TexToPDF, consolidateTex, RenderNjk } from './tools/converters.mjs';
import { CoverageData, Pets} from './test-data.mjs'
import fs from 'fs';
import path from "path";


/* Functions:
    RenderNjk(file.njk, data[as object])
        Returns string output of Nunjucks rendering

    TexToPDF(inputname.tex, outputname.pdf)

    NjkToPDF(file.njk, outputname.pdf, data[as object], config[as object, optional])
        Compiles to PDF, option to also save tex if config {save_tex: true}

    NjkToTex(file.njk, outputname.tex, data[as object])

    consolidateTex(inputname.tex, outputname.tex, refdir)
        Copies in any \input references into a single tex doc, \inputs should be rel to ref directory
*/

const testData = {"Name": "Rick", "Pets": Pets, "CoverageData": CoverageData}

// Example 1: Using LaTeX
//TexToPDF('Example1/demo.tex', 'demo.pdf')

// Example 2: Basic Nunjucks
//NjkToPDF('Example2/main.njk', 'PetNews.pdf', testData)

// Example 3: Project Structure
//NjkToPDF('Example3/main.njk', 'MyTable.pdf', testData, {save_tex: true}) // Saves intermediate tex file, helpful for debugging
//consolidateTex('MyTable.tex', 'Example3Consol.tex', 'projects/Example3') // Pastes in input sections. needs directory