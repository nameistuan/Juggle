const fs = require('fs');
let code = fs.readFileSync('src/components/EventModal.tsx', 'utf-8');

const dirtyLogReplacement = `
    const dirty = JSON.stringify(current) !== JSON.stringify(baseline)
    if (dirty) {
      console.log('--- IS DIRTY TRUE ---');
      console.log('CURRENT:', current);
      console.log('BASELINE:', baseline);
      Object.keys(current).forEach(k => {
        if (current[k] !== baseline[k]) {
          console.log(\`DIFF on \${k}: current="\${current[k]}" baseline="\${baseline[k]}"\`);
        }
      });
    }
`;

code = code.replace('const dirty = JSON.stringify(current) !== JSON.stringify(baseline)', dirtyLogReplacement);
fs.writeFileSync('src/components/EventModal.tsx', code);
console.log('Added logging to isDirty');
