import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(process.cwd(), 'src/lib/translations.ts');
let content = fs.readFileSync(filePath, 'utf8');

// The corrupted line is 360. 
// It looks like:   },ತಿಹಾಸ",
// We want to remove the garbage and fix the structure.
// Actually, it seems like a duplicate block starts there.
// We'll replace from 'verifiedWorkers: "ಪರಿಶೀಲಿಸಿದ ಕೆಲಸಗಾರರು",' 
// until the next 'report: "ವರದಿ",'

const targetPart = /verifiedWorkers: "ಪರಿಶೀಲಿಸಿದ ಕೆಲಸಗಾರರು",\s*\},.*ತಿಹಾಸ",\s*report: "ವರದಿ",/;
const replacement = 'verifiedWorkers: "ಪರಿಶೀಲಿಸಿದ ಕೆಲಸಗಾರರು",\n    history: "ಇತಿಹಾಸ",\n    report: "ವರದಿ",';

if (content.match(targetPart)) {
    console.log('Found target part with regex');
    content = content.replace(targetPart, replacement);
} else {
    console.log('Regex did not match. Trying line-by-line fix.');
    const lines = content.split('\n');
    // Lines are 0-indexed in array, so line 360 is index 359.
    // Line 360 (index 359):   },ತಿಹಾಸ",
    if (lines[359].includes('},') && lines[359].includes('ತಿಹಾಸ')) {
        console.log('Found corrupted line at index 359');
        lines[359] = '    history: "ಇತಿಹಾಸ",';
        content = lines.join('\n');
    }
}

fs.writeFileSync(filePath, content);
console.log('File updated successfully');
