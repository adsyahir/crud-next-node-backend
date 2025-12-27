const fs = require('fs');
const path = require('path');

function fixImports(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      fixImports(filePath);
    } else if (file.endsWith('.js')) {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      // Fix relative imports: from './xxx' or from '../xxx'
      content = content.replace(
        /from ['"](\.[^'"]+?)(?<!\.js)['"]/g,
        (match, p1) => {
          modified = true;
          return `from '${p1}.js'`;
        }
      );
      
      // Fix dynamic imports: import('./xxx')
      content = content.replace(
        /import\(['"](\.[^'"]+?)(?<!\.js)['"]\)/g,
        (match, p1) => {
          modified = true;
          return `import('${p1}.js')`;
        }
      );
      
      if (modified) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ Fixed: ${filePath}`);
      }
    }
  });
}

console.log('🔧 Fixing ES module imports...');
fixImports('./dist');
console.log('🎉 All imports fixed!');
