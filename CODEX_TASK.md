# Текущее состояние проекта для Codex

## Project

Личный сайт:
Марат Абзалов

Branch:
`redesign-2026`

## Git checkpoint policy

- Exact current HEAD не хранится в этом файле, потому что изменение `CODEX_TASK.md` само создает новый commit.
- Exact HEAD всегда определяется Git-командами.
- `CODEX_TASK.md` описывает завершенные этапы, следующий этап и текущие ограничения.
- Git history является source of truth для конкретных commits и фактического состояния проекта.
- Pushed state можно дополнительно проверить в GitHub:
  `https://github.com/Neotwalker/MA/tree/redesign-2026`

## Completed

- Personal global header and industry navigation.
- Global footer for personal brand.
- Cookie consent and preferences.
- Global buttons, modal forms, textarea states, validation and accessibility improvements.
- Development contact form, development services catalog and development page content stages.
- GitHub Pages deployment workflow.
- Utility pages and navigation links.
- Live Search, `search.html` and 404 search integration.
- `sitemap.html`.
- Portfolio architecture and cases registry.
- Redesigned `archive-case.html`.
- Portfolio archive responsive/filter/accessibility polish.
- Portrait responsive assets.
- Full redesign and polish of `about.html`.
- Reliable QA screenshot runner and QA artifact lifecycle documentation.
- Complete personal homepage redesign for `index.html`.
- Homepage expert content and article metadata.
- Complete grouped one-page project brief in `brief.html`.
- iOS Safari modal layout fix.
- Mobile modal input zoom and scrollbar fix.
- Brief form interaction and final QA fixes.
- Redesigned Funtech single case page `single-case.html`.
- Single case responsive polish.
- Editorial article archive `archive-articles.html`.
- Article archive media system, index heading polish, pagination and responsive UX polish.
- Single article long-read page `single-articles.html`.
- Single article TOC, sharing, bottom blocks, hero spacing and anchor offset polish.
- Unified blog page vertical rhythm.
- Global page top spacing fix across static pages.
- Redesigned and polished `contacts.html`.
- Article archive view counts metadata.
- Redesigned work conditions page in `conditions.html`.
- Redesigned standalone `faq.html` as the separate “Вопрос-ответ” page.
- Final FAQ UI/UX polish: transform-only icons, active navigation state, mobile overflow checks, modal and textarea scrollbar behavior.
- Shared header-to-breadcrumb spacing normalization for FAQ, work conditions, services taxonomy pages, service single page and services archive.
- Filled content for services taxonomy pages:
  - `services-taxonomy-seo.html`;
  - `services-taxonomy-branding.html`;
  - `services-taxonomy-reklama.html`;
  - `services-taxonomy-readysites.html`.
- Redesigned `services.html` as the services archive / top-level services map; user visual approval received before the individual service reference stage.
- Redesigned `services-single.html` as the first individual service reference page for “Разработка лендинга”.
- Prepared the individual service extended editor content area in `services-single.html`: the static reference now uses a generic `service-single-content` rich-text wrapper that mirrors future `the_content()` output.
- Individual service reference `services-single.html`: `USER APPROVED` by user visual review.
- Development category individual service pages (`Разработка сайтов`): static rollout implemented for production-confirmed URLs and ready for user visual review.

## Current task

Current redesign checkpoint:

- FAQ: `IMPLEMENTED / AWAITING USER VISUAL APPROVAL`.
- SERVICES ARCHIVE: `USER APPROVED`.
- INDIVIDUAL SERVICE REFERENCE (`services-single.html`, “Разработка лендинга”): `USER APPROVED`.
- DEVELOPMENT INDIVIDUAL SERVICE PAGES (`Разработка сайтов`): `IMPLEMENTED / AWAITING USER VISUAL APPROVAL`.

FAQ should not be marked `USER APPROVED` until the user reviews the live result and explicitly confirms acceptance.

Stop after the development category rollout checkpoint. Do not start SEO, branding, advertising, ready-sites, industry pages, pricing or other roadmap stages without a separate user command and user visual approval of the implemented development pages.

## Remaining roadmap

1. Пользовательская визуальная приемка individual service pages группы `Разработка сайтов`; затем отдельными командами масштабировать следующие группы услуг.
2. Стоимость после получения реальных цен.
3. Ревизия услуг и отраслевых страниц.
4. Ревизия отдельных кейсов.
5. Глоссарий.
6. Внутренняя перелинковка.
7. Персональная контентная ревизия.
8. SEO.
9. Performance.
10. Accessibility.
11. WordPress integration.
12. Rank Math / sitemap / robots / `llms.txt`.
13. Финальный release.

Портрет считается подготовленным этапом и не включается повторно.

## Important current constraints

- Рабочая ветка: только `redesign-2026`.
- `origin/main` не изменять.
- Source of truth по портфолио: `_reference/portfolio/`.
- Public production URLs are defined by current production `https://limitlesscreators.ru/`, not by static filenames.
- Existing production service paths must be preserved 1:1; static filenames are only frontend prototype files.
- Future WordPress services integration must preserve current production paths and map CPT/taxonomy output to those URLs.
- Static breadcrumbs не перерабатывать без отдельного задания.
- В WordPress breadcrumbs выводятся через `rank_math_the_breadcrumbs()`.
- Future services WordPress architecture: услуги реализуются через CPT услуг, `services.html` становится reference для archive template, taxonomy prototype pages становятся reference для taxonomy archive templates, списки услуг выводятся динамически по taxonomy term. Точные post type / taxonomy slugs брать из существующей WordPress-архитектуры, не придумывать.
- Portrait face/appearance нельзя изменять.
- Не считать существование файла признаком завершенности этапа: сверяться с Git history и фактическим состоянием.
- QA artifacts сохранять до user review, кроме папок, которые пользователь явно разрешил удалить.

## Individual service extended content architecture

- Confirmed source of truth from the user / author of the old site: the old production `taxonomy--idea` content on service pages was rendered through the standard WordPress editor output, `the_content()`.
- Future individual service pages use the standard WordPress post editor for extended editorial / SEO content, then render it with `the_content()`.
- Structural UI blocks stay separate from `the_content()`: hero, fit, work, process, result, cases, related services, articles and contacts remain dedicated template components.
- Extended editorial content is rendered inside the generic `service-single-content` section:

```php
<section class="section service-single-content">
    <div class="container">
        <div class="service-single-content__body">
            <?php the_content(); ?>
        </div>
    </div>
</section>
```

- Empty post content means the entire `service-single-content` section is not rendered: no empty section, wrapper, heading, padding or divider should appear.
- Checking whether content exists must be handled correctly in the future WordPress theme before rendering the section; the public output remains the standard `the_content()`, not a custom field replacement.
- The current static HTML is only the frontend reference. PHP implementation stays in the separate later WordPress integration stage.

## Portrait assets

В следующих задачах не изменять и не перекодировать без отдельной явной команды:

```text
app/img/brand/marat-abzalov-portrait.png
app/img/brand/source/marat-abzalov-portrait-original.png
app/img/brand/marat-abzalov-portrait-480.webp
app/img/brand/marat-abzalov-portrait-480.avif
app/img/brand/marat-abzalov-portrait-768.webp
app/img/brand/marat-abzalov-portrait-768.avif
app/img/brand/marat-abzalov-portrait-1120.webp
app/img/brand/marat-abzalov-portrait-1120.avif
```

Portrait QA уже одобрен пользователем.
