import sharp from 'sharp';
import { readdir, mkdir, mkdtemp, rm } from 'fs/promises';
import { join, parse } from 'path';
import { execSync } from 'child_process';
import { tmpdir } from 'os';

const ASSETS_DIR = join(import.meta.dirname, '..', 'public', 'assets');
const OUTPUT_DIR = join(ASSETS_DIR, 'products');

function sanitizeFilename(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const tmpDir = await mkdtemp(join(tmpdir(), 'heic-convert-'));

  const files = await readdir(ASSETS_DIR);
  const imageFiles = files.filter(f => {
    const ext = f.toLowerCase();
    return ext.endsWith('.heic') || ext.endsWith('.jpeg') || ext.endsWith('.jpg') || ext.endsWith('.png');
  });

  console.log(`Found ${imageFiles.length} image files to convert`);
  console.log(`Temp dir: ${tmpDir}`);

  let converted = 0;
  let failed = 0;

  for (const file of imageFiles) {
    const { name, ext } = parse(file);
    const outputName = sanitizeFilename(name) + '.webp';
    const inputPath = join(ASSETS_DIR, file);
    const outputPath = join(OUTPUT_DIR, outputName);

    try {
      let sharpInput = inputPath;

      // For HEIC files, use macOS sips to convert to JPEG first
      if (ext.toLowerCase() === '.heic') {
        const tempJpeg = join(tmpDir, sanitizeFilename(name) + '.jpg');
        execSync(`sips -s format jpeg "${inputPath}" --out "${tempJpeg}" -s formatOptions 90`, {
          stdio: 'pipe',
        });
        sharpInput = tempJpeg;
      }

      await sharp(sharpInput)
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(outputPath);

      converted++;
      if (converted % 20 === 0) {
        console.log(`  ... ${converted} converted so far`);
      }
    } catch (err) {
      failed++;
      console.log(`  [FAIL] ${file}: ${err.message}`);
    }
  }

  // Cleanup temp dir
  await rm(tmpDir, { recursive: true, force: true });

  console.log(`\nDone: ${converted} converted, ${failed} failed`);
}

main();
