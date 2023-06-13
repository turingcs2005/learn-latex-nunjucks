import { NjkToTex, NjkToPDF, TexToPDF, consolidateTex, RenderNjk } from './tools/converters.mjs';
import { CoverageData, Pets, TestString} from './test-data.mjs'
import fs from 'fs';
import path from "path";


/* Functions:
    RenderNjk(file.njk, data[as object])
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

const testData = {"Name": "Rick", "Pets": Pets, "CoverageData": CoverageData, "TestString": TestString}

// Example 1: Using LaTeX
//TexToPDF('Example1/demo.tex', 'HanoverDemo.pdf')

// Example 2: Basic Nunjucks
//NjkToPDF('Example2/main.njk', 'MyPets.pdf', testData)

// Example 3: Project Structure
//NjkToPDF('Example3/main.njk', 'MyTable.pdf', testData, {save_tex: true})
//consolidateTex('MyTable.tex', 'MyTableConsol.tex', 'projects/Example3') // Pastes in input sections. needs directory