//@ts-check
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { describe, it, afterEach } = require('mocha');
const codegen = require('escodegen');
const parser = require('../../lib/util/parser')
const { JavaScriptEmitter, DeclarationEmitter, JSONEmitter } = require('../../lib/emitter');;
const typings = require('../../lib/util/typings');

const esprima = require('esprima');


describe('emitter', () => {


    const baselineDir = path.join(__dirname, 'baselines')
    const dirs = fs.readdirSync(baselineDir)
    const cwd = process.cwd();
    afterEach(function () {
        process.chdir(cwd);
    });
    for (const dir of dirs) {
        it(`javascript-emitter-${dir}`, () => {

            process.chdir(path.join(baselineDir, dir));
            const content = fs.readFileSync('input.exml', 'utf-8');
            typings.initTypings();
            const skinNode = parser.generateAST(content)
            const emitter = new JavaScriptEmitter();
            const result = emitter.generateJavaScriptAST(skinNode);
            fs.writeFileSync('1.log', JSON.stringify(skinNode, null, '\t'), 'utf-8');
            fs.writeFileSync('2.log', codegen.generate(result), 'utf-8');
            const outputJavaScript = fs.readFileSync('expected-output-js.txt', 'utf-8')
            const outputJavaScriptAst = esprima.parseScript(outputJavaScript);
            assert.deepEqual(result, outputJavaScriptAst)

        })

        it('declaration-emitter', () => {
            process.chdir(path.join(baselineDir, dir));
            const content = fs.readFileSync('input.exml', 'utf-8');
            const skinNode = parser.generateAST(content)
            const emitter = new DeclarationEmitter();
            emitter.emitSkinNode('input.exml', skinNode);
            let result = emitter.getResult();
            result = result.split('\r').join('');
            let outputDeclaration = fs.readFileSync("expected-output-d-ts.txt", 'utf-8');
            outputDeclaration = outputDeclaration.split('\r').join('');
            assert.equal(outputDeclaration, result);
        })

        it('json-emitter', () => {
            process.chdir(path.join(baselineDir, dir));
            const content = fs.readFileSync('input.exml', 'utf-8');
            const skinNode = parser.generateAST(content)
            const emitter = new JSONEmitter();
            emitter.emitSkinNode('input.exml', skinNode);
            const result = emitter.getResult();
            const outputDeclaration = fs.readFileSync("expected-output-json.txt", 'utf-8');
            assert.deepEqual(JSON.parse(outputDeclaration), JSON.parse(result));
        })
    }

})