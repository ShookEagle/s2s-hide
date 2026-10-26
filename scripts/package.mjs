import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { zipSync } from 'fflate';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const { version } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const archive = join(root, 'dist', `s2s-hide-${version}.zip`);
const files = {};
function addFile(source, destination) {
  files[destination] = new Uint8Array(readFileSync(source));
}
function addDirectory(source, destination) {
  for (const entry of readdirSync(source, { withFileTypes: true })) {
    const from = join(source, entry.name), to = `${destination}/${entry.name}`;
    if (entry.isDirectory()) addDirectory(from, to);
    else if (entry.isFile()) addFile(from, to);
  }
}

const addon = 'addons/s2script';
const docs = `${addon}/docs/s2s-hide`;
addFile(join(root, 'dist/s2s-hide.s2sp'), `${addon}/plugins/s2s-hide.s2sp`);
addDirectory(join(root, 'translations'), `${addon}/translations`);
for (const name of ['README.md', 'LICENSE', 'NOTICE']) addFile(join(root, name), `${docs}/${name}`);
// Corresponding source accompanies the binary, including its build instructions.
for (const name of ['src', 'test', 'scripts', 'translations']) {
  addDirectory(join(root, name), `${docs}/source/${name}`);
}
for (const name of ['package.json', 'package-lock.json', 'tsconfig.json', 'README.md', 'LICENSE', 'NOTICE']) {
  addFile(join(root, name), `${docs}/source/${name}`);
}
mkdirSync(join(root, 'dist'), { recursive: true });
writeFileSync(archive, zipSync(files, { level: 9 }));
console.log(archive);
