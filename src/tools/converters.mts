'use strict'

import path from 'path';
import fs from 'fs';
import nunjucks from "nunjucks";
import latex from "./node-latex.mjs"

const env = nunjucks.configure('projects', {
    autoescape: true,
    tags: {
        variableStart: '#!',
        variableEnd: '!#',
        blockStart: '[##',
        blockEnd: '##]',
        commentStart: '%!',
        commentEnd: '!%'
    }
});

function setOptions(ref_dir: string) {
    const myOptions = {
        passes: 2,
        inputs: [path.resolve('shared'), path.resolve('projects', ref_dir)]
      };
    return myOptions
}

// Compiles the .tex files CONTENTS (as a STRING) to create the PDF
function compilePDF(input: string, output_file_path: string, options: any) {
    const output = fs.createWriteStream(output_file_path);
    const pdf = latex(input, options);
    pdf.pipe(output);
    pdf.on('error', (err: any) => console.error(err));
    pdf.on('finish', () => console.log('PDF generated!'));
}

// Returns just the .tex file output from Nunjucks
// input path relative to nunjucks configuration path ('/views')
function NjkToTex(input_path: string, output_name: string, data: any) {
    const input = nunjucks.render(input_path, data);
    let TexTest = fs.createWriteStream(path.resolve("tex-files", output_name))
    TexTest.write(input);
}

function RenderNjk(input_path: string, data: any) {
    return nunjucks.render(input_path, data);
}

// Takes the nunjucks file, applies nunjucks functions and logic, and then returns corresponding PDF
// input path relative to nunjucks configuration path ('/views')
// optional parameter to save the .tex file to the TexTests folder
function NjkToPDF(input_path: string, output_name: string, data: any, save_tex = false) {
    const input = nunjucks.render(input_path, data);
    if (save_tex) {
        const tex_name = output_name.replace(/([\w]*)\.pdf/g, '$1' + '.tex');
        let TexTest = fs.createWriteStream(path.resolve("tex-files", tex_name));
        TexTest.write(input);
    }
    const ref_direct = input_path.split("/")[0];
    compilePDF(input, path.resolve("pdf", output_name), setOptions(ref_direct));
}

// reads in a .tex file and returns contents as a string
function TexToString(file_path: string, file_name: string) {
    return fs.readFileSync(path.resolve(file_path, file_name), 'utf8')
}

// Compiles a .tex file
function TexToPDF(input_name: string, output_name: string, ref_dir: string) {
    const input = TexToString("tex-files", input_name)
    compilePDF(input, path.resolve("pdf", output_name), setOptions(ref_dir))
} 


// function input needs to be the .tex contents as a string, not the file name
function consolidateTexHelper(input: string, ref_dir: string) {
    return input.replace(/\\input{([\w\/.]+)}/g, (match, p1) => TexToString(ref_dir, p1));
}

// Takes a tex file and inserts all \input{filepath} text files, filepath should be relative to ref_dir
function consolidateTex(input_name: string, output_name: string, ref_dir: string) {
    const asString = TexToString("tex-files", input_name);
    const newString = consolidateTexHelper(asString, path.join('projects',ref_dir));
    let consolidated = fs.createWriteStream(path.resolve("tex-files", output_name));
    consolidated.write(newString);
}

export { NjkToTex, NjkToPDF, TexToPDF, consolidateTex, RenderNjk}