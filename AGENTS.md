# Марат Абзалов: правила работы для Codex

Authoritative Abzalov-Lab project-wide operational instructions:
`C:\Users\and1m\Desktop\work\MA-project\limitless-wp\wp-content\AGENTS.md`

Read that tracked file before work in this repository. This file keeps only canonical frontend repository notes.

## Назначение проекта

Это личный сайт Марата Абзалова. Текущая рабочая ветка содержит статический redesign сайта в исходной Gulp-верстке и служит утвержденным frontend reference для будущей WordPress-интеграции.

Limitless Creators - прежнее название/обозначение работы самого Марата. Это не отдельное агентство, команда или сторонний исполнитель. Все проекты портфолио выполнены лично Маратом Абзаловым; различается только объем и формат выполненных работ.

В публичных текстах использовать первый человек или нейтральную форму. Не писать «мы», «наша команда», «агентство», не указывать Limitless Creators как отдельного исполнителя и не придумывать роли, результаты, метрики или состав команды. Объем участия описывать строго по реальным работам, подтвержденным страницами кейсов или `_reference`.

## Рабочие области проекта

### Frontend reference repository

Путь:
`C:\Users\and1m\Desktop\work\MA-project\limitless-codex`

GitHub:
`https://github.com/Neotwalker/MA/`

Рабочая ветка:
`redesign-2026`

Назначение:

- утвержденный frontend reference;
- утвержденные layout, responsive behavior, UI-компоненты и интеракции;
- статическая архитектура страниц;
- источник assets и frontend-логики;
- источник для маппинга static HTML -> WordPress templates.

Текущий статический source остается в `app/`.

### OpenServer runtime reference

Путь:
`D:\OpenServer\domains\limitlesscreators`

Production:
`https://limitlesscreators.ru/`

`D:` is runtime only, not source. Runtime/source workflow rules are owned by the authoritative tracked WordPress `AGENTS.md`.

## Repository

- Основной GitHub repository: `https://github.com/Neotwalker/MA/`.
- Рабочая ветка проекта: `redesign-2026`.
- GitHub repository можно использовать для проверки уже pushed состояния проекта.
- Точный текущий HEAD определять через Git-команды, а не по вручную записанному hash в документации.
- Не добавлять raw URLs репозитория на публичные страницы сайта. Эти ссылки допустимы только во внутренней Codex-документации.

## Структура frontend reference

- `app/*.html` - статические шаблоны страниц.
- `app/sass/main.sass` - основные стили.
- `app/sass/_media.sass` - адаптивные стили.
- `app/js/common.js` - исходный JavaScript.
- `app/css/main.min.css` и `app/js/scripts.min.js` - generated-файлы. Не редактировать вручную.
- `app/search-index.json` - generated search index.
- `app/img/brand/` - постоянные брендовые изображения и подготовленные portrait assets.
- `_reference/` содержит зафиксированные архитектурные и контентные источники истины.
- `dist/` - результат сборки. Не использовать как исходник и не коммитить.

## Canonical repository role

- Static redesign имеет статус `STRUCTURALLY COMPLETE / APPROVED WORDPRESS REFERENCE`.
- `app/` остается canonical source для утвержденных UI, markup, styles, assets и JS behavior.
- Breadcrumbs статического прототипа являются reference structure only.
- В WordPress breadcrumbs выводятся через `rank_math_the_breadcrumbs()`.

## Команды и проверки

Стандартные project scripts:

```bash
npm.cmd run lint:project
npm.cmd run build
npm.cmd run verify:dist
git diff --check
```

Для измененного исходного JS также выполнять:

```bash
node --check <changed-js-source>
```

Documentation-only задачи обычно проверяются только:

```bash
git diff --check
git status --short
git diff --stat
```

Не выполнять `npm ci` автоматически. Использовать существующее окружение и установленные `node_modules`. Если `npm` отсутствует в `PATH`, использовать установленный bundled/local Node и существующие зависимости проекта.

## Общие ограничения

1. Не менять несвязанные страницы, стили и скрипты.
2. Не переписывать существующий компонент без необходимости.
3. Не добавлять новый фреймворк, сборщик или библиотеку без прямой причины.
4. Сохранять текущую BEM-подобную систему классов и визуальный язык.
5. Все визуальные изменения должны работать на мобильных, планшетах и десктопах.
6. Не редактировать минифицированные файлы вручную.
7. Не добавлять `node_modules`, `dist` и `.qa-artifacts/` в Git.
8. `#bg_container.bg_container` и `canvas#gradient-canvas` - часть утвержденной арт-системы redesign: при redesign/refactor существующих страниц не удалять, не заменять и не отключать без отдельной явной команды; переиспользовать текущую реализацию, не создавать дополнительные canvas без необходимости, сохранять performance, mobile behavior, `prefers-reduced-motion`, accessibility и interaction.

## SEO / content responsibility boundary

Codex в этом development-проекте не начинает самостоятельно:

- Wordstat research;
- semantic discovery;
- demand/frequency collection;
- SERP research for keyword strategy;
- query clustering;
- keyword -> URL mapping;
- cannibalization planning;
- semantic SEO copy generation.

Эти работы выполняются отдельно пользователем вместе с ChatGPT в проекте «Контент для моего сайта». Codex получает и внедряет утвержденный результат этого workflow, когда он передан в задаче.

Codex может выполнять technical SEO в рамках разработки:

- semantic HTML;
- canonical integration;
- Rank Math integration;
- schema integration when specified;
- breadcrumbs;
- sitemap support;
- robots;
- metadata output;
- redirects;
- internal links when mappings are supplied;
- technical indexability rules.

Не смешивать technical SEO implementation с semantic research. Тексты service rollout остаются `APPROVED STRUCTURE / DRAFT SEO COPY`, если финальные SEO/content материалы еще не переданы.

## HTML / W3C validation

### Pre-WordPress

- Исправлять подтвержденные shared semantic/ARIA defects до копирования компонентов в PHP.
- Static homepage W3C baseline уже clean: пользователь вручную проверил `https://neotwalker.github.io/MA/index.html` через validator.w3.org после W3C-commit этапов `9b3b4f4` и `3fe0487`; итог по homepage: 0 errors.
- Это не означает, что каждая статическая HTML-страница проверена отдельно.
- Не тратить время на ручную W3C-проверку каждой static page только ради повторения той же проверки после WordPress-интеграции.

### Post-WordPress

Валидировать generated representative page types через W3C/Nu HTML Checker:

- homepage;
- services archive;
- service taxonomy;
- single service;
- industry page;
- Ready Sites taxonomy;
- Ready Site product;
- portfolio archive;
- single case;
- article archive;
- single article;
- about;
- contacts;
- FAQ;
- brief;
- work conditions/legal;
- search;
- 404;
- other unique templates where applicable.

Shared errors исправлять на уровне template, template-part или component, а не патчить rendered pages по одной. После clean representative templates выполнить broader final validation перед production release.

Никогда не глушить validator errors бессмысленными ARIA roles. Accessibility semantics важнее поверхностно зеленого валидатора.

## Canonical screenshot runner

Project-wide QA mode, artifact lifecycle, commit, push and runtime sync rules are owned by the authoritative tracked WordPress `AGENTS.md`.

If screenshots are explicitly requested, this repository provides:

```bash
npm run qa:screenshots -- --url <url> --task <task-slug>
```

If `npm` отсутствует в `PATH`, использовать bundled/local Node:

```bash
node scripts/capture-qa-screenshots.mjs --url <url> --task <task-slug>
```

## Project workflow owner

Use the authoritative tracked WordPress `AGENTS.md` for project-wide workflow, Git, QA, runtime sync, content and WordPress integration rules.
