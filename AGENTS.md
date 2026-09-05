# Марат Абзалов: правила работы для Codex

## Назначение проекта

Это личный сайт Марата Абзалова. Текущая рабочая ветка содержит статический redesign сайта в исходной Gulp-верстке и служит утвержденным frontend reference для будущей WordPress-интеграции.

Limitless Creators - прежнее название/обозначение работы самого Марата. Это не отдельное агентство, команда или сторонний исполнитель. Все проекты портфолио выполнены лично Маратом Абзаловым; различается только объем и формат выполненных работ.

В публичных текстах использовать первый человек или нейтральную форму. Не писать «мы», «наша команда», «агентство», не указывать Limitless Creators как отдельного исполнителя и не придумывать роли, результаты, метрики или состав команды. Объем участия описывать строго по реальным работам, подтвержденным страницами кейсов или `_reference`.

## Рабочие области проекта

### Frontend reference repository

Путь:
`C:\Users\and1m\Desktop\work\limitless-codex`

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

### Existing WordPress installation

Путь:
`D:\OpenServer\domains\limitlesscreators`

Production:
`https://limitlesscreators.ru/`

Это локальная копия существующего/current WordPress-проекта и будущая цель интеграции. Стратегия не заключается в создании чистого WordPress с нуля. Предпочтительная модель: сохранить и проаудировать существующую WordPress-инсталляцию, базу данных, контент и полезную инфраструктуру, затем внедрить утвержденный frontend через новую или рефакторинговую theme architecture.

Не изменять WordPress-проект, не создавать тему и не проводить глубокий аудит без отдельной задачи.

## Repository

- Основной GitHub repository: `https://github.com/Neotwalker/MA/`.
- Рабочая ветка проекта: `redesign-2026`.
- GitHub repository можно использовать для проверки уже pushed состояния проекта.
- Точный текущий HEAD определять через Git-команды, а не по вручную записанному hash в документации.
- `origin/main` защищен: не изменять и не push без отдельной явной команды пользователя.
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

## Текущий workflow

- Static redesign сейчас имеет статус `STRUCTURALLY COMPLETE / APPROVED WORDPRESS REFERENCE`.
- Следующий крупный этап: read-only audit существующего WordPress в `D:\OpenServer\domains\limitlesscreators`.
- Аудит должен идти до создания новой темы и до переноса frontend в PHP.
- После утверждения архитектуры WordPress production source станет новая или рефакторинговая тема, а статическая верстка останется эталоном интерфейса.
- Breadcrumbs статического прототипа не перерабатывать без отдельного задания.
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

### QA режимы

DEFAULT = code-level QA. Не запускать автоматически Browser QA, Playwright, screenshots, screenshot matrices, dev server visual review или viewport matrix.

FAST MODE подходит для локальных semantic corrections, copy changes, micro UI fixes, небольших SASS-правок, изолированных JS-правок и документации. Использовать только проверки, релевантные изменению.

FULL CODE-LEVEL QA нужен для новой страницы/шаблона, крупного shared component, mass rollout, substantial shared JS/SASS, WordPress architecture/template rollout и high-risk changes. FULL QA не означает автоматический Browser QA, Playwright или screenshots.

Browser QA использовать только если:

1. пользователь явно попросил;
2. конкретная visual/interaction проблема действительно требует браузера;
3. high-risk interaction нельзя разумно проверить на уровне кода.

Пользователь обычно выполняет финальное визуальное ревью вручную.

### Reviewer / autocheck timeouts

Если reviewer/autocheck повторно зависает или истекает до того, как процесс реально стартовал:

- не повторять одну команду бесконечно;
- максимум 1-2 разумные попытки;
- при необходимости использовать эквивалентную безопасную команду;
- если commit/push уже успешен, не держать сессию только ради получения hash;
- не считать reviewer timeout ошибкой кода.

Если одинаковый sandbox/runtime setup failure повторяется, не зацикливаться.

## Общие ограничения

1. Не менять несвязанные страницы, стили и скрипты.
2. Не переписывать существующий компонент без необходимости.
3. Не добавлять новый фреймворк, сборщик или библиотеку без прямой причины.
4. Сохранять текущую BEM-подобную систему классов и визуальный язык.
5. Все визуальные изменения должны работать на мобильных, планшетах и десктопах.
6. Не редактировать минифицированные файлы вручную.
7. Не добавлять `node_modules`, `dist` и `.qa-artifacts/` в Git.
8. Не использовать вымышленные кейсы, цифры, отзывы, результаты, роли или состав команды.
9. Не обещать рост заявок, продаж, трафика или позиций без подтвержденных данных.
10. Не изменять внешность человека на портретах: лицо, черты, глаза, очки, волосы, бороду, кожу, возраст, одежду, пропорции и выражение лица.
11. Не использовать image generation, AI face enhancement или generative fill для портретов.
12. `#bg_container.bg_container` и `canvas#gradient-canvas` - часть утвержденной арт-системы redesign: при redesign/refactor существующих страниц не удалять, не заменять и не отключать без отдельной явной команды; переиспользовать текущую реализацию, не создавать дополнительные canvas без необходимости, сохранять performance, mobile behavior, `prefers-reduced-motion`, accessibility и interaction.

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

## Git workflow

После каждого завершенного связного этапа:

1. Выполнить релевантные проверки.
2. Проверить `git diff`.
3. Создать отдельный осмысленный commit.
4. Если возможно, сразу push в `origin/redesign-2026`.
5. После push проверить, что локальный HEAD совпадает с `origin/redesign-2026`.
6. Не изменять `origin/main`.
7. Не использовать force push без отдельной явной команды пользователя.

Не объединять несвязанные этапы в один commit.

Если push заблокирован system reviewer/runtime:

- не обходить ограничение;
- оставить локальный commit готовым;
- сообщить точный локальный HEAD и состояние remote.

Git history служит журналом завершенных этапов и помогает ChatGPT/Codex понимать актуальное состояние проекта.

## Browser QA и временные артефакты

### QA lifecycle

Для visual redesign / UI-polish задач разделять статус реализации и пользовательскую приемку:

- `IMPLEMENTED` - код реализован, проверки выполнены, commit/push выполнены.
- `USER APPROVED` - пользователь отдельно просмотрел живой результат и явно подтвердил, что визуальный этап принят.

Codex не должен самостоятельно помечать visual stage как окончательно принятый пользователем после собственного QA. Если этап реализован, но пользователь еще не подтвердил результат, фиксировать статус как `IMPLEMENTED / AWAITING USER VISUAL APPROVAL` и не переводить следующий visual stage в работу автоматически.

Скриншоты и PNG не являются обязательным QA-артефактом и не создаются автоматически только ради отчета. Если screenshot, лог, временный скрипт или другой QA-артефакт все же создан по явной просьбе пользователя или для диагностики конкретной найденной проблемы:

1. Использовать `.qa-artifacts/<task-slug>/`.
2. Не использовать общий системный `%TEMP%`.
3. Созданные QA-артефакты текущей задачи после проверки не удалять.
4. В итоговом отчете перечислять полные пути ко всем реально созданным QA-артефактам.
5. Если пользователь попросил визуальный контроль по артефактам, сохранять их до его подтверждения.
6. Только в следующей задаче, после подтверждения пользователя, разрешено удалить QA-папку предыдущего этапа.
7. В начале следующей задачи удалять только конкретную уже просмотренную папку предыдущего этапа.
8. Никогда не очищать всю `.qa-artifacts/` автоматически.
9. Не удалять QA-артефакты, которые пользователь еще не просмотрел.
10. Если нужна повторная QA-итерация до пользовательского ревью, не уничтожать предыдущие материалы: использовать подпапку `iteration-2` или уникальные имена, либо заменять файлы только по явной команде пользователя.

Не удалять произвольные файлы из `%TEMP%`, файлы других приложений, проектов или неизвестного происхождения. Не использовать локальные временные пути к скриншотам как постоянные материалы проекта.

### Browser QA

- Использовать существующий локальный сервер, если он уже запущен и browser check действительно нужен.
- Не запускать дополнительный сервер без необходимости.
- Использовать один browser context и одну вкладку.
- Переиспользовать вкладку для всех URL и viewport.
- Не создавать отдельный context или вкладку для каждого скриншота.
- Не запускать параллельные browser-проверки.
- После проверки закрывать страницы и contexts, созданные автоматизацией.
- Не завершать пользовательские процессы Chrome.
- Не удалять и не изменять пользовательские профили Chrome.
- Для modal, menu, keyboard, Live Search, console assertions и DOM assertions можно использовать встроенный Codex Browser, если задача реально требует browser execution.

### Screenshot QA

- Не запускать screenshot runner автоматически.
- Создавать screenshots только если пользователь явно попросил, если нужно зафиксировать конкретную найденную визуальную проблему или если screenshot действительно полезен как debugging artifact.
- Для сохранения PNG использовать project runner: `npm run qa:screenshots -- --url <url> --task <task-slug>`.
- Если `npm` отсутствует в `PATH`, использовать bundled/local Node: `node scripts/capture-qa-screenshots.mjs --url <url> --task <task-slug>`.
- Runner запускает isolated headless Chrome process, использует отдельный profile внутри `.qa-artifacts/` и не подключается к пользовательскому Chrome.
- Встроенный Browser screenshot API не является обязательным способом сохранения PNG. Если он работает, его можно использовать дополнительно.
- Generated screenshots сохранять согласно QA lifecycle.

## WordPress-интеграция

### Preferred integration model

Постоянное архитектурное правило:

```text
EXISTING WORDPRESS
+
EXISTING DATABASE
+
EXISTING CONTENT
+
EXISTING USEFUL PLUGIN/SEO/REDIRECT INFRASTRUCTURE
+
NEW APPROVED FRONTEND/THEME IMPLEMENTATION
```

Не создавать clean separate WordPress project без конкретной причины, найденной поздним аудитом. Возможные причины: modified/corrupted core, compromised installation, irreparable theme/plugin architecture, critical database corruption или demonstrably safer migration path. Не предполагать, что эти условия сейчас существуют.

Не удалять и не заменять старую инсталляцию во время разработки.

### Audit before implementation

Read-only audit существующего WordPress должен идти до создания новой темы. Во время аудита не изменять WordPress project, database, plugins, theme files, uploads, `.htaccess` или configuration.

Существующая инсталляция может содержать redirects, content, CPT/taxonomy registrations, ACF field groups/data, Rank Math configuration/data, plugin configuration, permalink/rewrite behavior, relations between posts/terms and other production business logic. Это infrastructure to inspect and preserve where valid, а не заранее подтвержденный список фактов.

### Theme strategy

Предпочтительное направление после аудита:

- keep existing WordPress installation;
- keep old working theme available during migration;
- create a new/refactored theme for the redesign;
- migrate template-by-template;
- reuse existing database/content/configuration;
- move reusable site/business logic out of old presentation code when necessary;
- avoid changing WordPress core or plugins.

Не фиксировать заранее имя новой темы или точную структуру директорий. Это решение принимается после аудита.

### Theme switch risk

Перед переключением темы Codex должен определить functionality, зарегистрированную старой темой:

- `register_post_type()`;
- `register_taxonomy()`;
- rewrite rules;
- shortcodes;
- image sizes;
- custom REST endpoints;
- AJAX handlers;
- form hooks;
- ACF PHP field registration;
- custom options;
- Rank Math filters;
- redirect filters;
- custom cron/actions;
- theme-specific helpers.

Если business/content architecture завязана на старую тему, не переключать тему так, чтобы эта функциональность исчезла. Явно решить, где ей жить дальше: в новой теме, существующем custom plugin или новом site-specific plugin. Long-lived CPT/taxonomy architecture не должна случайно зависеть от presentation theme, если ее разумно вынести.

### Implementation principles

- Использовать semantic HTML/PHP.
- Разносить shared components по template-parts, не собирать giant monolithic template.
- Не складывать всю логику в `functions.php`.
- Использовать WordPress APIs для URLs, queries, permalinks и term links.
- Сохранять существующие public URLs, если пользователь явно не утвердил изменение.
- Использовать ACF только для подходящих structured data.
- Нормальный редактор WordPress и `the_content()` использовать для approved editorial content.
- Optional empty fields/blocks не должны выводить empty markup.
- Required ACF fields делать только там, где component не может корректно работать без данных.
- Экранировать вывод: `esc_html()`, `esc_attr()`, `esc_url()`, `wp_kses_post()`.
- После custom loops and queries выполнять `wp_reset_postdata()`.
- Не изменять plugins и WordPress core.
- Не хранить passwords, SMTP/API secrets, keys в Git.
- ACF changes оформлять управляемо через PHP registration или `acf-json` согласно выбранной архитектуре.
- Dynamic links to WP objects строить через WordPress permalink/term APIs, а не hard-coded local paths.

### Архитектура услуг в WordPress

- Услуги должны быть реализованы через Custom Post Type услуг.
- Known/confirmed existing architecture: post type `services`; taxonomies `service_category` и `service_tag`.
- Не придумывать alternate slugs без проверки локального WordPress-проекта.
- `services.html` в static redesign является reference для future service archive template.
- `services-taxonomy-dev.html`, `services-taxonomy-seo.html`, `services-taxonomy-branding.html`, `services-taxonomy-reklama.html` являются reference для service taxonomy archive templates.
- Individual service pages в WordPress должны формироваться из записей CPT услуг.
- WordPress individual services должны использовать реальные существующие records where they already exist; не создавать duplicate service entries blindly.
- Сначала маппить existing WordPress record -> taxonomy -> production URL -> approved static reference.
- Списки услуг внутри taxonomy pages формировать динамически по принадлежности записи CPT к term.
- Ссылки на individual services строить через permalink, ссылки на taxonomy archives - через term links.
- Добавление новой услуги в админке не должно требовать ручного изменения taxonomy template.
- Ready Sites не форсировать автоматически в `/services/` URL architecture.

### Service extended content / the_content()

Old production service extended content рендерился через стандартный WordPress editor output, `the_content()`.

Future individual service pages:

- structural UI blocks remain template components;
- extended editorial/SEO content stays in the normal WordPress editor and renders through `the_content()`;
- do not replace editor content with ACF without explicit architectural reason.

Reference structure:

```php
<section class="section service-single-content">
    <div class="container">
        <div class="service-single-content__body">
            <?php the_content(); ?>
        </div>
    </div>
</section>
```

If editor content is empty, omit the entire section: no empty wrapper, padding or divider.

### URL and redirect policy

Existing production URLs from `https://limitlesscreators.ru/` must be preserved unless the user explicitly approves a URL architecture change.

Do not improve, simplify, translate, normalize or recreate legacy slugs by intuition. Existing redirects must be audited before changing them.

Do not recreate redirects inside the new theme if they already have a durable home such as Rank Math, a dedicated redirect plugin or server config.

Ready Sites root namespace is an explicit approved exception/new architecture: `/ready-made-sites/`.

## Формат работы

Перед крупным изменением:

1. Изучи связанные HTML, SASS, JavaScript и, если применимо, WordPress-шаблоны.
2. Кратко перечисли файлы, которые планируешь менять.
3. Выполни изменение небольшим связанным набором правок.
4. Запусти проверки, релевантные типу задачи, и сообщи точный результат.
5. Перечисли измененные файлы, созданные QA-артефакты и оставшиеся ограничения.
