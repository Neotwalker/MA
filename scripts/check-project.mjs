import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const required = [
  'app/index.html',
  'app/services-taxonomy-dev.html',
  'app/sass/main.sass',
  'app/js/common.js',
  'app/.htaccess',
  'gulpfile.js',
  'package.json',
];

const missing = required.filter((file) => !existsSync(file));
if (missing.length) {
  console.error('Отсутствуют обязательные файлы:');
  missing.forEach((file) => console.error(`- ${file}`));
  process.exit(1);
}

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
for (const script of ['dev', 'build']) {
  if (!packageJson.scripts?.[script]) {
    console.error(`В package.json отсутствует скрипт: ${script}`);
    process.exit(1);
  }
}

const countMatches = (text, pattern) => (text.match(pattern) || []).length;
const htmlFiles = readdirSync('app')
  .filter((file) => file.endsWith('.html'))
  .sort();
const htmlStructureErrors = [];

for (const file of htmlFiles) {
  const filename = join('app', file);
  const source = readFileSync(filename, 'utf8');
  const structure = {
    doctype: countMatches(source, /<!doctype\b/gi),
    htmlOpen: countMatches(source, /<html\b/gi),
    htmlClose: countMatches(source, /<\/html\s*>/gi),
    headOpen: countMatches(source, /<head\b/gi),
    headClose: countMatches(source, /<\/head\s*>/gi),
    bodyOpen: countMatches(source, /<body\b/gi),
    bodyClose: countMatches(source, /<\/body\s*>/gi),
  };

  for (const [name, value] of Object.entries(structure)) {
    if (value !== 1) {
      htmlStructureErrors.push(`${filename}: ${name} = ${value}, expected 1`);
    }
  }

  const betweenHeadAndBody = source.match(/<\/head\s*>([\s\S]*?)<body\b/i);
  if (!betweenHeadAndBody) {
    htmlStructureErrors.push(`${filename}: не найден корректный переход </head> -> <body>`);
  } else if (betweenHeadAndBody[1].trim()) {
    htmlStructureErrors.push(`${filename}: найден посторонний текст между </head> и <body>`);
  }
}

if (htmlStructureErrors.length) {
  console.error('Найдены ошибки HTML-структуры:');
  htmlStructureErrors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log('Структура проекта проверена: обязательные файлы, npm-скрипты и HTML-оболочки на месте.');
