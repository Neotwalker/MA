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
- Initial redesign of standalone `faq.html` as the separate “Вопрос-ответ” page; final FAQ completion depends on the current follow-up UI/UX correction.
- Filled content for services taxonomy pages:
  - `services-taxonomy-seo.html`;
  - `services-taxonomy-branding.html`;
  - `services-taxonomy-reklama.html`;
  - `services-taxonomy-readysites.html`.

## Current task

FAQ follow-up UI/UX correction over commit `1fb9e15ef2685b3f44635a5e89bdd53aed5a3a24`.

Текущую реализацию `faq.html` пользователь не принял. FAQ считать окончательно completed только после этой correction, финального интерактивного browser review, проверок, commit и push. После завершения остановиться и не начинать pricing, services phase или другие roadmap stages без отдельной команды.

## Remaining roadmap

1. Стоимость после получения реальных цен.
2. Ревизия услуг и отраслевых страниц.
3. Ревизия отдельных кейсов.
4. Глоссарий.
5. Внутренняя перелинковка.
6. Персональная контентная ревизия.
7. SEO.
8. Performance.
9. Accessibility.
10. WordPress integration.
11. Rank Math / sitemap / robots / `llms.txt`.
12. Финальный release.

Портрет считается подготовленным этапом и не включается повторно.

## Important current constraints

- Рабочая ветка: только `redesign-2026`.
- `origin/main` не изменять.
- Source of truth по портфолио: `_reference/portfolio/`.
- Static breadcrumbs не перерабатывать без отдельного задания.
- В WordPress breadcrumbs выводятся через `rank_math_the_breadcrumbs()`.
- Future services WordPress architecture: услуги реализуются через CPT услуг, `services.html` становится reference для archive template, taxonomy prototype pages становятся reference для taxonomy archive templates, списки услуг выводятся динамически по taxonomy term. Точные post type / taxonomy slugs брать из существующей WordPress-архитектуры, не придумывать.
- Portrait face/appearance нельзя изменять.
- Не считать существование файла признаком завершенности этапа: сверяться с Git history и фактическим состоянием.
- QA artifacts сохранять до user review, кроме папок, которые пользователь явно разрешил удалить.

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
