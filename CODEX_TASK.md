# Canonical historical/reference context for Codex

> Historical / canonical reference only.
>
> This file does not define the current project task, migration roadmap,
> operational rules, or Git workflow.
>
> Current operational rules:
> `C:\Users\and1m\Desktop\work\MA-project\limitless-wp\wp-content\AGENTS.md`
>
> Current migration stage / next task:
> `C:\Users\and1m\Desktop\work\MA-project\limitless-wp\wp-content\docs\REBRAND-MIGRATION-ROADMAP.md`

## Project

Личный сайт:
Марат Абзалов

Frontend reference branch:
`redesign-2026`

Frontend reference path:
`C:\Users\and1m\Desktop\work\MA-project\limitless-codex`

OpenServer runtime:
`D:\OpenServer\domains\limitlesscreators`

Production site:
`https://limitlesscreators.ru/`

## Ownership

- `CODEX_TASK.md` preserves canonical frontend history and technical reference context.
- Exact HEAD and pushed state are determined through Git, not this file.
- Current project stage, gates and next task are owned by the WordPress roadmap.
- Project-wide operational and Git workflow rules are owned by the tracked WordPress `AGENTS.md`.

## Canonical frontend reference checkpoint

Static redesign:
`STRUCTURALLY COMPLETE / APPROVED WORDPRESS REFERENCE`

Static homepage W3C baseline:
`USER VALIDATED / COMPLETE`

Пользователь вручную проверил homepage `https://neotwalker.github.io/MA/index.html` через validator.w3.org после shared W3C fixes, включая финальный combobox fix. Итог homepage: 0 errors.

Это не означает, что каждая static HTML page была индивидуально провалидирована. Не тратить время на полную ручную W3C-проверку всех static pages перед WordPress-интеграцией; shared defects уже исправлялись на уровне shared components.

## Completed / user-approved frontend systems

Статический redesign готов как WordPress reference. Следующие системы и этапы имеют статус `USER APPROVED`:

- services archive;
- individual service reference;
- Development individual pages: 25/25;
- global breadcrumbs;
- FAQ;
- taxonomy header system;
- portfolio archive;
- portfolio mobile filters;
- Industry pages: 7/7;
- SEO individual service pages: 11/11;
- Branding individual service pages: 4/4;
- Reklama individual service pages: 6/6;
- Ready Sites taxonomy;
- Ready Site product reference: car rental;
- global/shared UI systems previously explicitly accepted by user.

Не использовать устаревшие статусы о том, что Development pages, FAQ, SEO, Branding, Reklama или Ready Sites еще ожидают rollout/review. Не останавливаться на старом чекпойнте Development rollout.

## Ready Sites locked architecture

Ready Sites - самостоятельный productized niche-site catalog. Он связан с Services на уровне information architecture/navigation, но использует отдельный root-level URL namespace.

Production namespace:
`https://limitlesscreators.ru/ready-made-sites/`

Current approved product:
`Готовый сайт для аренды авто`

URL:
`https://limitlesscreators.ru/ready-made-sites/arenda-avto/`

Future planned product:
`Готовый сайт для строительства каркасных домов`

Planned URL:
`https://limitlesscreators.ru/ready-made-sites/karkasnye-doma/`

Frame-houses page сейчас не существует и не должна создаваться до готовности реального продукта.

Previous namespace `/services/ready-made-sites/...` superseded и не является текущей production architecture.

## Historical WordPress audit milestone

Earlier planning listed `READ-ONLY AUDIT OF EXISTING WORDPRESS INSTALLATION`
as the next active task.

That audit and later integration architecture phases were completed later in
the project. See Git history and the current WordPress roadmap for current
state, sequence, gates and next task.

## Migration roadmap owner

The active migration sequence, current stage, current batch, gates and next
task are owned by:

`C:\Users\and1m\Desktop\work\MA-project\limitless-wp\wp-content\docs\REBRAND-MIGRATION-ROADMAP.md`

Do not reconstruct the current roadmap from historical sections in this file.

## Canonical technical/reference facts

- Рабочая ветка frontend reference: only `redesign-2026`.
- Frontend source of truth: `app/`.
- `_reference/` remains source of truth where applicable.
- Existing OpenServer runtime: `D:\OpenServer\domains\limitlesscreators`.
- Runtime rules are owned by the tracked WordPress `AGENTS.md`.
- Production URLs from `https://limitlesscreators.ru/` must be preserved unless explicitly changed by the user.
- Existing redirects must be audited before changing them.
- Static breadcrumbs не перерабатывать без отдельного задания.
- В WordPress breadcrumbs выводятся через `rank_math_the_breadcrumbs()`.
- Portrait face/appearance нельзя изменять; protected portrait assets remain protected.
- `#bg_container.bg_container` and `canvas#gradient-canvas` remain protected shared art-system elements.
- Не считать существование файла признаком завершенности этапа: сверяться с Git history и фактическим состоянием.

## Services WordPress architecture

Known/confirmed existing architecture includes:

- post type: `services`;
- taxonomies: `service_category`, `service_tag`.

Do not invent alternate slugs without inspecting the actual local WordPress project.

Static references:

- `app/services.html` -> future service archive reference.
- `app/services-taxonomy-dev.html`, `app/services-taxonomy-seo.html`, `app/services-taxonomy-branding.html`, `app/services-taxonomy-reklama.html` -> taxonomy archive references.
- Individual service static pages -> future single service references.

Ready Sites is special: do not automatically force Ready Sites into the same `/services/` URL architecture.

WordPress individual services should use current real records where they already exist. Do not create duplicate service entries blindly. First map existing WordPress record -> taxonomy -> production URL -> approved static reference.

## Service extended content architecture

Confirmed source of truth from the user / author of the old site: old production service extended content was rendered through the standard WordPress editor output, `the_content()`.

Future individual service pages use the standard WordPress post editor for extended editorial / SEO content, then render it with `the_content()`.

Structural UI blocks stay separate from `the_content()`: hero, fit, work, process, result, cases, related services, articles and contacts remain dedicated template components.

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

Empty post content means the entire `service-single-content` section is not rendered: no empty section, wrapper, heading, padding or divider should appear.

Do not replace editor content with ACF without explicit architectural reason.

## Historical WordPress audit note

Earlier versions of this file listed WordPress facts and unknowns before the
initial audit. That pre-audit unknown list is historical. Use the WordPress
roadmap, architecture docs and Git history for current WordPress source state.

## SEO / content boundary

Codex does not independently run Wordstat, semantic research, demand/frequency collection, SERP keyword strategy, clustering, keyword -> URL mapping, cannibalization planning or semantic SEO copy generation in this development project.

Those activities are handled separately by the user and ChatGPT in «Контент для моего сайта». Codex implements approved output from that workflow when supplied.

Codex may implement technical SEO: semantic HTML, canonicals, Rank Math integration, schema when specified, breadcrumbs, sitemap, robots, metadata, redirects, supplied internal-link mappings and technical indexability rules.

Existing rollout service texts remain `APPROVED STRUCTURE / DRAFT SEO COPY` unless final SEO/content work has been supplied.

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
