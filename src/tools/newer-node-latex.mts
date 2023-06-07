'use strict'

import strToStream from 'string-to-stream';
import child_process from 'child_process';
const spawn = child_process.spawn;
import through from 'through2';
import fse from 'fs-extra';
import temp_module from 'temp';
const temp = temp_module.track();
import path from 'path';
import fs from 'fs';
import { TexToString } from './converters.mjs';

function resolvePaths(paths: any) {
    if (Array.isArray(paths)) {
        return paths.map(pth => path.resolve(pth))
    }
    return path.resolve(paths)
}

function newLatex(input: string, config: any) {

    const joinPaths = (inputs: any) =>
        (Array.isArray(inputs) ? inputs.join(path.delimiter) : inputs) +
        path.delimiter;

    const outputStream: any = through()

    const handleErrors = (err: any) => {
        outputStream.emit('error', err)
        outputStream.destroy()
    }

    temp.mkdir('node-latex', (err, tempPath) => {
        let inputStream = strToStream(input)

        const inputPaths = {
            TEXINPUTS: joinPaths(resolvePaths(config.input_paths)),
            TTFONTS: joinPaths(tempPath),
            OPENTYPEFONTS: joinPaths(tempPath)
        }

        const opts = {
            cwd: tempPath,
            env: Object.assign({}, process.env, inputPaths)
        }

        const runLatex = (inputStream: any) => {
            const tex = spawn(config.cmd, config.args, opts)
            inputStream.pipe(tex.stdin)
        
            tex.stdin.on('error', handleErrors) // Prevent Node from crashing on compilation error.
            tex.on('error', () => {
                handleErrors(new Error(`Error: Unable to run ${config.cmd} command.`))
            })
    
            tex.stdout.on('data', (data) => { });
            tex.stderr.on('data', (data) => { });
            tex.on('close', (code) => { });
    
            tex.on('exit', (code) => {
                if (code !== 0) {
                    console.log("Error code:")
                    console.log(code)
                    return
                }
                returnDocument()
            })
        }

        const returnDocument = () => {
            const pdfPath = path.join(tempPath, 'texput.pdf')
            const pdfStream = fs.createReadStream(pdfPath)
            pdfStream.pipe(outputStream)
            pdfStream.on('close', () => fse.removeSync(tempPath))
            pdfStream.on('error', handleErrors)
        }

        runLatex(inputStream)
    })
    return outputStream
}


export {newLatex}


