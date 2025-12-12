const sharp = require("sharp");

const sizes = [16, 32, 48, 96, 128];
const input = "public/icons/focus-ring.svg";

async function generateIcons() {
  for (const size of sizes) {
    await sharp(input)
      .resize(size, size)
      .png()
      .toFile(`public/icons/icon${size}.png`);

    console.log(`Generated icon${size}.png`);
  }
}

generateIcons().catch(err => console.error(err));
