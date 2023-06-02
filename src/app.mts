import { NjkToTex, NjkToPDF, TexToPDF, consolidateTex, RenderNjk } from './tools/converters.mjs';
import { CoverageData, Pets} from './test-data.mjs'
import fs from 'fs';
import path from "path";

const testData = {"Name": "YOURNAME", "Pets": Pets, "CoverageData": CoverageData}

/* Functions:
    RenderNjk(projectdir/file.njk, data[as object])
        Returns string output of Nunjucks rendering

    TexToPDF(inputname.tex, outputname.pdf, data[as object])
        Searches for input in tex-files dir

    NjkToPDF(projectdir/file.njk, outputname.pdf, data[as object], save_tex=false)
        Saves output to pdf dir, option to also save tex

    NjkToTex(projectdir/file.njk, outputname.tex)
        Saves output to tex-files dir

    consolidateTex(inputname.tex, outputname.tex, relevantdirectory)
        Copies in text from preamble/sections into a single tex document
*/


// Example 1: Using LaTeX
//TexToPDF('Example1/Hanover.tex', 'HanoverDemo.pdf', 'shared')

// Example 2: Basic Nunjucks
//NjkToPDF('Example2/main.njk', 'PetNews.pdf', testData)

// Example 3: Project Structure
//NjkToPDF('Example3/main.njk', 'Table.pdf', testData, true) // Nunjucks to Tex, helpful for debugging
//consolidateTex('Table.tex', 'consolTable.tex', 'Example3') // Pastes in input sections. needs directory