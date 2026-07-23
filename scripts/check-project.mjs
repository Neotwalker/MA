import { existsSync, readFileSync } from 'node:fs';

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

console.log('Структура проекта проверена: обязательные файлы и npm-скрипты на месте.');
