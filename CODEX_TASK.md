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
- Git history является source of truth для конкретных commits.
- Pushed state можно дополнительно проверить в GitHub:
  `https://github.com/Neotwalker/MA/tree/redesign-2026`

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
- portrait responsive assets;
- full redesign `about.html`;
- reliable QA screenshot runner.

## Current task

Следующий этап:

Продолжение и завершение главной страницы `index.html`.

Важно: не начинать `index.html` в рамках текущей infrastructure-задачи.

## Remaining roadmap

1. Продолжение и завершение главной.
2. Переработка `brief.html`.
3. Стоимость после получения реальных цен.
4. Условия работы.
5. Редизайн блога и статьи.
6. Вопрос-ответ.
7. Ревизия услуг и отраслевых страниц.
8. Ревизия отдельных кейсов.
9. Глоссарий.
10. Внутренняя перелинковка.
11. Персональная контентная ревизия.
12. SEO.
13. Performance.
14. Accessibility.
15. WordPress integration.
16. Rank Math / sitemap / robots / `llms.txt`.
17. Финальный release.

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
