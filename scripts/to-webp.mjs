import sharp from "sharp";

const [input, output, width = "1280"] = process.argv.slice(2);
if (!input || !output) {
  console.error("Usage: node scripts/to-webp.mjs <input> <output.webp> [width]");
  process.exit(1);
}
await sharp(input).resize({ width: Number(width), withoutEnlargement: true }).webp({ quality: 80 }).toFile(output);
console.log(`${output} written`);
