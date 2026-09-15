import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const publicDirectory = path.resolve(process.cwd(), 'public');
const sourceExtensions = new Set(['.png', '.jpg', '.jpeg']);

async function findSourceImages(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findSourceImages(entryPath)));
      continue;
    }

    if (sourceExtensions.has(path.extname(entry.name).toLowerCase())) {
      files.push(entryPath);
    }
  }

  return files;
}

async function generateVariants(sourcePath) {
  const extension = path.extname(sourcePath);
  const basePath = sourcePath.slice(0, -extension.length);
  const variants = [
    { extension: '.webp', convert: (image) => image.webp({ quality: 82 }) },
    { extension: '.avif', convert: (image) => image.avif({ quality: 55, effort: 4 }) },
  ];

  for (const variant of variants) {
    const outputPath = `${basePath}${variant.extension}`;
    await variant.convert(sharp(sourcePath)).toFile(outputPath);
    console.log(`${path.relative(process.cwd(), sourcePath)} -> ${path.relative(process.cwd(), outputPath)}`);
  }
}

const sourceImages = await findSourceImages(publicDirectory);

if (sourceImages.length === 0) {
  console.log('No PNG, JPG, or JPEG source images found under public/.');
} else {
  await Promise.all(sourceImages.map(generateVariants));
  console.log(`Generated WebP and AVIF variants for ${sourceImages.length} source image(s).`);
}
