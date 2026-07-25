const fs = require('fs');
const path = require('path');

const srcDir = 'D:/compx animation';
const destDir = path.join(__dirname, '../public/comp-saver/frames');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const entries = fs.readdirSync(srcDir, { withFileTypes: true });

for (const entry of entries) {
  if (entry.isDirectory() && entry.name.endsWith('_frames')) {
    const projName = entry.name.replace('_frames', '');
    const folderSrc = path.join(srcDir, entry.name);
    const folderDest = path.join(destDir, projName);

    if (!fs.existsSync(folderDest)) {
      fs.mkdirSync(folderDest, { recursive: true });
    }

    const files = fs.readdirSync(folderSrc);
    for (const file of files) {
      if (file.endsWith('.png')) {
        fs.copyFileSync(path.join(folderSrc, file), path.join(folderDest, file));
      }
    }
    console.log(`Copied ${files.length} frames for ${projName}`);
  }
}
