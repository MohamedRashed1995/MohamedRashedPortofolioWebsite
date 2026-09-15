import path from 'node:path';
import sharp from 'sharp';

const sourcePath = path.resolve(process.cwd(), 'public/profile.jpg');
const outputPath = path.resolve(process.cwd(), 'public/og-image.jpg');

await sharp(sourcePath)
  .resize(1200, 630, {
    fit: 'cover',
    position: 'attention',
  })
  .jpeg({ quality: 82, progressive: true, mozjpeg: true })
  .toFile(outputPath);

console.log('Generated public/og-image.jpg at 1200x630.');
