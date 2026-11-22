import { mkdir, copyFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
const dir = join(process.cwd(), 'dist');
await mkdir(join(dir, 'vendor'), { recursive: true });
for (const file of ['index.html', 'manifest.webmanifest', 'sw.js', 'icon.svg', 'lobby.css', 'lobby.js', 'preview.js', 'preview.css']) {
  await copyFile(file, join(dir, file));
}
const source = join(process.cwd(), 'node_modules', 'babylonjs', 'babylon.js');
const target = join(dir, 'vendor', 'babylon.js');
await copyFile(source, target);
const { size } = await stat(target);
if (size < 200_000) throw new Error('Babylon game engine bundle missing or unexpectedly small');
console.log(`Built STRIKE 5 V6, bundled Babylon engine (${size} bytes) for offline Android/PWA play`);
