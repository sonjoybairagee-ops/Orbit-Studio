const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const mogrtDir = 'D:/Dropout Skool/Dropout Asset/Assets from Rafayat Bhai/Shine effect and Captions from Live class/Torsten Mogrt';
const destDir = path.join(__dirname, '../public/mogrts');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const files = fs.readdirSync(mogrtDir);

for (const file of files) {
  if (file.endsWith('.mogrt')) {
    const baseName = file.replace('.mogrt', '');
    const cleanName = baseName.replace(/\s+/g, '_');
    const mogrtPath = path.join(mogrtDir, file);
    const tempZip = path.join(__dirname, `temp_${cleanName}.zip`);
    const tempOut = path.join(__dirname, `temp_${cleanName}`);

    fs.copyFileSync(mogrtPath, tempZip);

    try {
      if (fs.existsSync(tempOut)) fs.rmSync(tempOut, { recursive: true, force: true });
      fs.mkdirSync(tempOut, { recursive: true });

      // Extract zip using PowerShell
      execSync(`powershell -Command "Expand-Archive -Path '${tempZip}' -DestinationPath '${tempOut}' -Force"`);

      // Look for thumb.png or preview files
      const extractFiles = fs.readdirSync(tempOut);
      console.log(`Contents of ${baseName}:`, extractFiles);

      for (const ef of extractFiles) {
        if (ef.toLowerCase().endsWith('.png') || ef.toLowerCase().endsWith('.jpg') || ef.toLowerCase().endsWith('.mp4')) {
          const ext = path.extname(ef);
          fs.copyFileSync(path.join(tempOut, ef), path.join(destDir, `${cleanName}${ext}`));
          console.log(`Saved preview: ${cleanName}${ext}`);
        }
      }
    } catch (e) {
      console.error(`Failed to extract ${file}:`, e.message);
    } finally {
      if (fs.existsSync(tempZip)) fs.unlinkSync(tempZip);
      if (fs.existsSync(tempOut)) fs.rmSync(tempOut, { recursive: true, force: true });
    }
  }
}
