'use strict'

import path from 'path';
import fs from 'fs';
import nunjucks from "nunjucks";
import latex from "./new-node-latex.mjs"
import {nj_dir, tex_dir, pdf_dir, shared_dir} from "../config.mjs"

const pdf_path = path.resolve(pdf_dir)
const tex_path = path.resolve(tex_dir)
const shared_path = path.resolve(shared_dir)


const env = nunjucks.configure(nj_dir, {
    autoescape: false,
    tags: {
        variableStart: '#!',
        variableEnd: '!#',
        blockStart: '[##',
        blockEnd: '##]',
        commentStart: '%!',
        commentEnd: '!%'
    }
});

env.addFilter('texscape', function(str) {
    const fixslash = str.replace(/\\/g, "\\textbackslash");
    const fixsymbols = fixslash.replace(/(\$|%|&|#|_|\{|\})/g, "\\$1"); // replace tex special characters
    const fixspecial = fixsymbols.replace(/(\^|~)/g, "\\$1\{\}") // replace tex special characters with a different replacement syntax
    return fixspecial;
});

function setOptions(config: any = null) {
    config = config || {}
    const input_paths = [shared_path]
    if (config.extra_path) {
        const new_path = path.resolve(config.extra_path)
        input_paths.push(new_path)
    }

    const myOptions = {
        passes: 2,
        inputs: input_paths
    };

    return myOptions
}

// Compiles the .tex files CONTENTS (as a STRING) to create the PDF
function compilePDF(input: string, output_file: string, options: any) {
    const output = fs.createWriteStream(output_file);
    const pdf = latex(input, options);
    pdf.pipe(output);
    pdf.on('error', (err: any) => console.error(err));
    pdf.on('finish', () => console.log('PDF generated!'));
}

// Returns just the .tex file output from Nunjucks
// input file relative to nunjucks configuration path
function NjkToTex(input_file: string, output_name: string, data: any) {
    const input = nunjucks.render(input_file, data);
    let TexTest = fs.createWriteStream(path.join(tex_path, output_name))
    TexTest.write(input);
}

function RenderNjk(input_path: string, data: any) {
    return nunjucks.render(input_path, data);
}

// Takes the nunjucks file, applies nunjucks functions and logic, and then returns corresponding PDF
// input path relative to nunjucks configuration path
function NjkToPDF(input_file: string, output_name: string, data: any, config: any = null) {
    config = config || {}
    const input = nunjucks.render(input_file, data);

    if (config.save_tex) {
        const tex_name = output_name.replace(/([\w]*)\.pdf/g, '$1' + '.tex');
        let TexTest = fs.createWriteStream(path.join(tex_path, tex_name));
        TexTest.write(input);
    }

    const extra_path = config.extra_path ||  path.resolve(nj_dir, path.dirname(input_file))
    compilePDF(input, path.join(pdf_path, output_name), setOptions({extra_path: extra_path}))
}

// reads in a .tex file and returns contents as a string
function TexToString(file_name: string, file_dir = tex_path) {
    const exact_path = path.resolve(file_dir, file_name)
    return fs.readFileSync(exact_path, 'utf8')
}

// Compiles a .tex file
function TexToPDF(input_name: string, output_name: string, config: any = null) {
    const input = TexToString(input_name)
    compilePDF(input, path.join(pdf_path, output_name), setOptions(config))
} 


// function input needs to be the .tex contents as a string, not the file name
function consolidateTexHelper(input: string, ref_dir: string) {
    return input.replace(/\\input{([\w\/.]+)}/g, (match, p1) => TexToString(p1, ref_dir));
}

// Takes a tex file and inserts all \input{filepath} text files, filepath should be relative to ref_dir
function consolidateTex(input_name: string, output_name: string, ref_dir: string) {
    const asString = TexToString(input_name);
    const newString = consolidateTexHelper(asString, ref_dir);
    let consolidated = fs.createWriteStream(path.join(tex_path, output_name));
    consolidated.write(newString);
    return newString
}

export { NjkToTex, NjkToPDF, TexToPDF, consolidateTex, RenderNjk, TexToString}