#!/usr/bin/env node

const child_process = require('child_process');
const util = require('util');
const exec = util.promisify(child_process.exec);

const yargs = require('yargs');
const ora = require('ora');
const replaceInFiles = require('replace-in-files');

const argv = yargs
    .usage('switch-pattern\n\n  $ $0 <name>')
    .epilog('Copyright @ 2019')
    .argv;

const name = argv._[0];
const package = 'https://github.com/piecioshka/switch-pattern/archive/master.zip';

if (!name) {
    yargs.showHelp();
    process.exit(1);
}

const options = {
    files: [
        `${name}/README.md`,
        `${name}/package.json`,
        `${name}/package-lock.json`,
        `${name}/bin/cli.js`,
    ],
    from: /switch-pattern/g,
    to: name
};

const state = ora();
state.start();

async function isFileExist(name) {
    try {
        await exec(`stat ${name}`);
        return true;
    } catch (ignore) {
        // console.log(ignore);
        return false;
    }
}

(async () => {
    state.info(`Create project: ${name}`);
    try {
        const isDirectoryExist = await isFileExist(name);
        if (isDirectoryExist) {
            throw new Error('Directory exist');
        }
        // Fetch github.com/piecioshka/switch-pattern
        await exec(`wget ${package} -O switch-pattern.zip`);
        await exec(`unzip switch-pattern.zip`);
        await exec(`mv switch-pattern-master ${name}`);
        await exec(`rm -rf switch-pattern.zip`);
        // Replace all "switch-pattern" by "NAME"
        await replaceInFiles(options);
        // Git setup & commit
        await exec(`cd ${name} && git init && git add . && git commit -am "Generate project"`);
        state.succeed('Project created');
        state.stop();
    } catch (reason) {
        state.fail(`Project does not created properly: ${reason.message}`);
    }
})();
