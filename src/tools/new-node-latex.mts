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

/**
 * Generates a PDF stream from a LaTeX document.
 *
 * @param {String} src - The LaTeX document.
 * @param {Object} options - Optional compilation specifications.
 *
 * @return {DestroyableTransform}
 */

// resolve paths
function resolvePaths(paths: any) {
    if (Array.isArray(paths)) {
        return paths.map(pth => path.resolve(pth))
    }
    return path.resolve(paths)
}

// setup input paths for env 
function setInputPaths(options: any, tempPath: any) {
    const inputs = options.inputs ? resolvePaths(options.inputs) : tempPath // The path(s) to your TEXINPUTS
    const fonts = options.fonts ? resolvePaths(options.fonts) : tempPath // The path(s) to your font inputs for fontspec

    // Combines all paths into a single PATH to be added to process.env.
    const joinPaths = (inputs: any) =>
        (Array.isArray(inputs) ? inputs.join(path.delimiter) : inputs) +
        path.delimiter;

    const inputPaths = {
        TEXINPUTS: joinPaths(inputs),
        TTFONTS: joinPaths(fonts),
        OPENTYPEFONTS: joinPaths(fonts)
    }

    return inputPaths
}

// Handle precompiled files if given
function handlePrecompiled(precompiled: any, tempPath: any) {
    const copyPrecompiled = (pathToPrecompiled: any) => {
        fs.readdirSync(pathToPrecompiled).forEach(file =>
            fs.copyFileSync(path.resolve(pathToPrecompiled, file), path.resolve(tempPath, file))
        )
    }
    Array.isArray(precompiled) ? precompiled.forEach(copyPrecompiled) : copyPrecompiled(precompiled)
}

function printErrors(tempPath: any, userLogPath: any, outputStream: any) {    
    const errorLogPath = path.join(tempPath, 'texput.log')

    const handleErrors = (err: any) => {
        outputStream.emit('error', err)
        outputStream.destroy()
      }

    fs.stat(errorLogPath, (err, stats) => {
        if (err || !stats.isFile()) {
            outputStream.emit('error', new Error('No error log file.'))
            return
        }

        const errorLogStream = fs.createReadStream(errorLogPath)
        if (userLogPath) {
            const userLogStream = fs.createWriteStream(path.resolve(userLogPath))
            errorLogStream.pipe(userLogStream)
            userLogStream.on('error', (userLogStreamErr) => handleErrors(userLogStreamErr))
            }

        const errors: any = []
        errorLogStream.on('data', (data) => {
            const lines = data.toString().split('\n')
            lines.forEach((line, i) => {
                if (line.startsWith('! Undefined control sequence.')) {
                    errors.push(lines[i - 1])
                    errors.push(lines[i])
                    errors.push(lines[i + 1])
                } else if (line.startsWith('!')) {
                    errors.push(line)
                }
            })
        })

        errorLogStream.on('end', () => {
            const errMessage = `LaTeX Syntax Error\n${errors.join('\n')}`
            const error = new Error(errMessage)
            outputStream.emit('error', error)
        })
    })
}

// acually running latex
function latex(src: string, options: any = null) {
    const outputStream: any = through()

    const handleErrors = (err: any) => {
        outputStream.emit('error', err)
        outputStream.destroy()
      }

    // compiler gets called within this chunk
    temp.mkdir('node-latex', (err, tempPath) => {
        if (err) {
            handleErrors(err)
        }

        let inputStream = strToStream(src)

        options = options || {}
        const cmd = options.cmd || 'lualatex' // The binary command to run (`pdflatex`, `xetex`, etc).
        const passes = options.passes || 1 // The number of times to run LaTeX.
        const userLogPath = options.errorLogs // The path to where the user wants to save the error log file to.
        let completedPasses = 0 // The current amount of times LaTeX has run so far.

        const args = options.args || ['-halt-on-error']
        args.push('-jobname=texput')

        const opts = {
            cwd: tempPath,
            env: Object.assign({}, process.env, setInputPaths(options, tempPath))
        }

        const runLatex = (inputStream: any) => {
            const tex = spawn(cmd, args, opts)
            inputStream.pipe(tex.stdin)
        
            tex.stdin.on('error', handleErrors) // Prevent Node from crashing on compilation error.
            tex.on('error', () => {
                handleErrors(new Error(`Error: Unable to run ${cmd} command.`))
            })

            tex.stdout.on('data', (data) => { });
            tex.stderr.on('data', (data) => { });
            tex.on('close', (code) => { });

            tex.on('exit', (code) => {
                if (code !== 0) {
                    printErrors(tempPath, userLogPath, outputStream)
                    return
                }
                completedPasses++
                completedPasses >= passes ? returnDocument() : runLatex(strToStream(src)) // Schedule another run if necessary.
            })
        }

        //Returns the PDF stream after the final run.
        const returnDocument = () => {
            const pdfPath = path.join(tempPath, 'texput.pdf')
            const pdfStream = fs.createReadStream(pdfPath)
            pdfStream.pipe(outputStream)
            pdfStream.on('close', () => fse.removeSync(tempPath))
            pdfStream.on('error', handleErrors)
        }

        // Start the first run
        const precompiled = options.precompiled ? resolvePaths(options.precompiled) : null // Path(s) to precompiled files
        if (precompiled) {
            handlePrecompiled(precompiled, tempPath)
        }

        runLatex(inputStream)

    })
    return outputStream
}

export default latex;