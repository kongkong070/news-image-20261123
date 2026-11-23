// news-image-20261123 — entry program (Node 22, standard library only).
//
// The entry image is the entry.png sitting next to this script. Running this
// program places an exact copy of it at <output>/entry.png, where <output> is
// MAKEFUN_OUTPUT_DIR when set, or /output inside the grader's container.
//
// The output directory is created when it is missing, and it is never
// removed: the grader bind-mounts it, so deleting it would fail the run.
// After writing, the program reads the copy back and checks that its bytes
// are identical to the source before reporting success.

import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const sourcePath = join(scriptDir, 'entry.png');
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const targetPath = join(outputDir, 'entry.png');

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

const sourceBytes = readFileSync(sourcePath);

// The entry must be a real PNG: check the 8-byte PNG signature up front so a
// truncated or wrong file fails here with a clear message instead of
// silently producing an invalid entry.
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (sourceBytes.length < PNG_SIGNATURE.length || !sourceBytes.subarray(0, 8).equals(PNG_SIGNATURE)) {
  throw new Error(`${sourcePath} is not a PNG file (bad or missing PNG signature)`);
}

mkdirSync(outputDir, { recursive: true });
writeFileSync(targetPath, sourceBytes);

const writtenBytes = readFileSync(targetPath);
if (sha256(writtenBytes) !== sha256(sourceBytes)) {
  throw new Error(`entry.png mismatch: written bytes differ from ${sourcePath}`);
}

console.log(`wrote ${targetPath} (${sourceBytes.length} bytes, sha256 ${sha256(sourceBytes)})`);
