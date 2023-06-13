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
 * @param {Object} config - Optional compilation specifications.
 *
 * @return {DestroyableTransform}
 */

function handleConfigPaths(paths: string[]) {
    const resPaths = paths.map(pth => path.resolve(pth))
    const joinedPaths = (resPaths.join(path.delimiter)) + path.delimiter
    return joinedPaths
}

// not sure if this actually works
function handlePrecompiled(paths: string[], tempPath: any) {
    const copyPrecompiled = (pathToPrecompiled: any) => {
        fs.readdirSync(pathToPrecompiled).forEach(file =>
            fs.copyFileSync(path.resolve(pathToPrecompiled, file), path.resolve(tempPath, file))
        )
    }
    const precompiled = resolvePaths(paths)
    precompiled.forEach(copyPrecompiled)
}

function resolvePaths(paths: string[]) {
    return paths.map(pth => path.resolve(pth))
}

function runComplete(num_runs: number, warning_log: string[], max_runs= 3) {
    if (warning_log.length == 0) {
        console.log("Run complete!")
        return true
    } else if (num_runs >= max_runs) {
        console.log(warning_log)
        console.log("Maximum passes met; document may not be complete")
        return true
    } else {
        console.log(`Starting pass number ${num_runs + 1}`)
        return false
    }
}

function warningsLog(outputs: string[]) {
    const warnings: string[] = []
    const iswarning = /LaTeX Warning:/gm
    outputs.forEach((line) => {
        if (iswarning.test(line)) {
            warnings.push(line)
        }
    })
    return warnings
}

// Emits errors from logs to output stream, and also gives full log to user if requested.
function printErrors(errorLogPath: any, userLogPath: any) {
    const errorLogStream = fs.createReadStream(errorLogPath)
    const errors: any = []

    if (userLogPath) {
        const userLogStream = fs.createWriteStream(path.resolve(userLogPath))
        errorLogStream.pipe(userLogStream)
        userLogStream.on('error', (userLogStreamErr) => console.error(userLogStreamErr))
    }

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
        console.error(error)
        //outputStream.emit('error', error)
    })
}

function latex(src: string, config: any) {
    const outputStream = through()

    // Emits the given error to the returned output stream.
    const handleErrors = (err: any) => {
        outputStream.emit('error', err)
        outputStream.destroy()
    }

    config = config || {}
    const cmd = config.cmd || 'lualatex'
    const userLogPath = config.error_log_path // The path to where the user wants to save the error log file to.
    const input_paths = config.input_paths || []
    const font_paths = config.font_paths || []
    const precompiled_paths = config.precompiled || []
    const max_passes = config.max_passes || 5
    const args = config.args || ['-halt-on-error']
    args.push('-jobname=texput')

    temp.mkdir('node-latex', (err, tempPath) => {
        if (err) {
            handleErrors(err)
        }

        let inputStream = strToStream(src)

        const opts = {
            cwd: tempPath,
            env: Object.assign({}, process.env)
        }

        if (input_paths.length > 0) {
            opts.env.TEXINPUTS = handleConfigPaths(input_paths)
        }

        if (font_paths.length > 0) {
            const envFontPaths = handleConfigPaths(font_paths);
            opts.env.TTFONTS = envFontPaths;
            opts.env.OPENTYPEFONTS = envFontPaths;
        }

        if (precompiled_paths.length > 0) {
            handlePrecompiled(precompiled_paths, tempPath)
        }

        let completedPasses = 0

        // Runs a LaTeX child process on the document stream and then decides whether it needs to do it again.
        const runLatex = (inputStream: any) => {
            const tex = spawn(cmd, args, opts)
            inputStream.pipe(tex.stdin)

            tex.stdin.on('error', handleErrors) // Prevent Node from crashing on compilation error.

            tex.on('error', () => {
                handleErrors(new Error(`Unable to run ${config.cmd} command.`))
            })

            let logString: string = ""
            tex.stdout.setEncoding('utf-8')
            tex.stdout.on('data', (data) => {
                logString += data
            });

            tex.stderr.on('data', (data) => {});
            tex.on('close', (code) => { });
            tex.on('exit', (code) => {
                if (code !== 0) {
                    const errorLogPath = path.join(tempPath, 'texput.log')
                    printErrors(errorLogPath, userLogPath)
                    return
                }
                
                completedPasses++
                const lines = logString.split('\n')
                runComplete(completedPasses, warningsLog(lines), max_passes) ? returnDocument() : runLatex(strToStream(src))
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

        runLatex(inputStream)
    })

    return outputStream
}

export {latex};