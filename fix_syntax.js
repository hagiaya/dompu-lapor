const fs = require('fs');
const path = './src/app/lapor/page.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

// Find the stray `)` after </form> for the buat tab
const idx = lines.findIndex((line, i) => line.trim() === ')' && lines[i-1].trim() === '</form>' && lines[i+1].includes(') : ('));
if (idx !== -1) {
    lines.splice(idx, 1);
}

fs.writeFileSync(path, lines.join('\n'));
console.log("Fix applied");
