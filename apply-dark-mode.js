const fs = require('fs');
const path = require('path');

const replacements = [
    { regex: /bg-white(?! dark:bg-slate-900)/g, replace: 'bg-white dark:bg-slate-900' },
    { regex: /text-slate-900(?! dark:text-slate-50)/g, replace: 'text-slate-900 dark:text-slate-50' },
    { regex: /text-slate-800(?! dark:text-slate-200)/g, replace: 'text-slate-800 dark:text-slate-200' },
    { regex: /text-slate-700(?! dark:text-slate-300)/g, replace: 'text-slate-700 dark:text-slate-300' },
    { regex: /text-slate-600(?! dark:text-slate-400)/g, replace: 'text-slate-600 dark:text-slate-400' },
    { regex: /bg-slate-50(?! dark:bg-slate-800)/g, replace: 'bg-slate-50 dark:bg-slate-800' },
    { regex: /bg-slate-100(?! dark:bg-slate-700)/g, replace: 'bg-slate-100 dark:bg-slate-700' },
    { regex: /border-slate-100(?! dark:border-slate-700)/g, replace: 'border-slate-100 dark:border-slate-700' },
    { regex: /border-slate-200(?! dark:border-slate-700)/g, replace: 'border-slate-200 dark:border-slate-700' },
    { regex: /border-gray-100(?! dark:border-slate-700)/g, replace: 'border-gray-100 dark:border-slate-700' },
    { regex: /border-gray-200(?! dark:border-slate-700)/g, replace: 'border-gray-200 dark:border-slate-700' },
    { regex: /bg-gray-50(?! dark:bg-slate-950)/g, replace: 'bg-gray-50 dark:bg-slate-950' },
    { regex: /text-gray-800(?! dark:text-gray-200)/g, replace: 'text-gray-800 dark:text-gray-200' },
    { regex: /text-gray-500(?! dark:text-gray-400)/g, replace: 'text-gray-500 dark:text-gray-400' },
    { regex: /bg-slate-900(?! dark:bg-slate-950)/g, replace: 'bg-slate-900 dark:bg-slate-950' }
];

function walk(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx')) results.push(file);
        }
    });
    return results;
}

const files = [...walk('src/app'), ...walk('src/components')];

let updatedFiles = 0;
files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    let original = content;
    replacements.forEach(r => {
        content = content.replace(r.regex, r.replace);
    });
    if (content !== original) {
        fs.writeFileSync(f, content);
        updatedFiles++;
    }
});

console.log(`Updated ${updatedFiles} files for Dark Mode.`);
