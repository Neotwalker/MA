# Текущее состояние проекта для Codex

## Project

Личный сайт:
Марат Абзалов

Branch:
`redesign-2026`

## Current checkpoint

После текущего документационного commit ожидаемый предыдущий функциональный этап:

```text
ff0899649f97f4b50c2416e60249416fbac4a8ca
Finalize portfolio archive content
```

Portrait commit:

```text
77682c629fee529cf084b94de2ac552b8bf56bb5
Prepare personal portrait assets
```

Не фиксировать будущий hash документационного commit, так как он пока неизвестен.

## Completed

- personal header;
- footer;
- cookie consent;
- hero главной;
- логотип;
- buttons;
- modal textarea;
- navigation;
- `about.html` initial version;
- `sitemap.html`;
- GitHub Pages Actions;
- Live Search;
- `search.html`;
- 404 search;
- portfolio architecture;
- cases registry;
- redesigned `archive-case.html`;
- responsive/filter/accessibility portfolio work;
- portrait responsive assets.

## Current task

Следующий этап после синхронизации документации:

Полная переработка `about.html` с использованием подготовленного портрета.

Важно: не начинать `about.html` в рамках текущей документационной задачи.

## Remaining roadmap

1. Полная переработка `about.html`.
2. Продолжение и завершение главной.
3. Переработка `brief.html`.
4. Стоимость после получения реальных цен.
5. Условия работы.
6. Редизайн блога и статьи.
7. Вопрос-ответ.
8. Ревизия услуг и отраслевых страниц.
9. Ревизия отдельных кейсов.
10. Глоссарий.
11. Внутренняя перелинковка.
12. Персональная контентная ревизия.
13. SEO.
14. Performance.
15. Accessibility.
16. WordPress integration.
17. Rank Math / sitemap / robots / `llms.txt`.
18. Финальный release.

Портрет считается подготовленным этапом и не включается повторно.

## Important current constraints

- `origin/main` не изменять.
- Source of truth по портфолио: `_reference/portfolio/`.
- Static breadcrumbs не перерабатывать без отдельного задания.
- В WordPress breadcrumbs выводятся через `rank_math_the_breadcrumbs()`.
- Portrait face/appearance нельзя изменять.
- QA artifacts сохранять до user review.

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
