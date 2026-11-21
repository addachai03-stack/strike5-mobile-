import {mkdir, copyFile} from 'node:fs/promises';
import {join} from 'node:path';
const out=join(process.cwd(),'dist');
await mkdir(out,{recursive:true});
for (const file of ['index.html','manifest.webmanifest','sw.js','icon.svg']) await copyFile(file,join(out,file));
console.log('Built STRIKE 5 web assets');
