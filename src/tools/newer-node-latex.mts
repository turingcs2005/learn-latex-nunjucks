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

function newLatex(input_file: string, config: any) {

    const input = TexToString(input_file);
    
    const joinPaths = (inputs: any) =>
        (Array.isArray(inputs) ? inputs.join(path.delimiter) : inputs) +
        path.delimiter;

    const outputStream: any = through()

    const handleErrors = (err: any) => {
        outputStream.emit('error', err)
        outputStream.destroy()
    }

    const printErrors = (tempPath: any, userLogPath: any = false) => {
        const errorLogPath = path.join(tempPath, 'texput.log')
    
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

    temp.mkdir('node-latex', (err, tempPath) => {
        let inputStream = strToStream(input)

        const inputPaths = {
            TEXINPUTS: joinPaths(resolvePaths(config.input_paths))
            //TTFONTS: joinPaths(tempPath)
            //OPENTYPEFONTS: joinPaths(tempPath)
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
                    printErrors(tempPath)
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


