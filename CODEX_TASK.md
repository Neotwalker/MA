# Текущее состояние проекта для Codex

## Project

Личный сайт:
Марат Абзалов

Frontend reference branch:
`redesign-2026`

Frontend reference path:
`C:\Users\and1m\Desktop\work\limitless-codex`

Existing WordPress integration target:
`D:\OpenServer\domains\limitlesscreators`

Production site:
`https://limitlesscreators.ru/`

## Git checkpoint policy

- Exact current HEAD не хранится в этом файле, потому что изменение `CODEX_TASK.md` само создает новый commit.
- Exact HEAD всегда определяется Git-командами.
- `CODEX_TASK.md` описывает завершенные этапы, текущий checkpoint, следующий этап и актуальные ограничения.
- Git history является source of truth для конкретных commits и фактического состояния проекта.
- Pushed state можно дополнительно проверить в GitHub:
  `https://github.com/Neotwalker/MA/tree/redesign-2026`

## Current checkpoint

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

## Next task

Следующий этап:
`READ-ONLY AUDIT OF EXISTING WORDPRESS INSTALLATION`

Target:
`D:\OpenServer\domains\limitlesscreators`

Purpose:
понять, что можно безопасно сохранить и переиспользовать перед проектированием новой theme architecture.

Do NOT begin implementation until the audit is reviewed. Do NOT create a new theme before the audit.

Audit must determine:

1. WordPress version and environment structure.
2. Active theme.
3. Installed/active plugins.
4. Whether WordPress core appears standard.
5. Existing custom themes/plugins.
6. Where CPTs are registered.
7. Where taxonomies are registered.
8. Existing post types.
9. Existing taxonomy terms.
10. Existing permalink/rewrite structure.
11. Existing ACF field groups.
12. Whether ACF fields are stored through admin, PHP registration, `acf-json` or mixed.
13. Existing Rank Math configuration relevant to theme migration.
14. Existing redirect implementation: Rank Math, Redirection plugin, `.htaccess`, custom PHP or other.
15. Existing form stack.
16. Existing scripts/styles/assets that contain business logic worth retaining.
17. Existing theme functions that must survive theme switch.
18. Anything theme-dependent that would disappear when old theme is deactivated.
19. Current WP content that should map into the new frontend.
20. Risks before theme switch.

The audit is read-only. Do not change the WordPress project during the audit.

## Current roadmap

1. Static homepage W3C baseline - COMPLETE.
2. Update project documentation - CURRENT.
3. Read-only audit of existing local WordPress.
4. Approve WordPress integration architecture.
5. Decide theme vs site-plugin responsibility boundaries.
6. Create new theme scaffold inside existing WP installation.
7. Integrate global components: header, navigation, footer, modals/forms, cookie UI, background/canvas system.
8. Integrate core static pages.
9. Integrate Services CPT/taxonomy system.
10. Map/migrate existing service records to approved frontend templates.
11. Integrate Industry pages.
12. Integrate Ready Sites architecture.
13. Integrate portfolio/cases.
14. Integrate articles.
15. Integrate about/contacts/FAQ/conditions/brief/search/404 and other utility templates.
16. Reuse/migrate ACF and existing data.
17. Integrate forms and required business logic.
18. Integrate supplied approved SEO/content materials when available.
19. Rank Math / metadata / canonical / schema / sitemap / robots / `llms.txt`.
20. W3C validation of generated WordPress templates.
21. Accessibility and performance QA.
22. Redirect/URL migration verification.
23. Final production migration/release QA.

Do not include Wordstat, semantic discovery, clustering or keyword mapping as Codex development roadmap stages. Those belong to the separate content workflow unless the user supplies approved output to implement.

## Important current constraints

- Рабочая ветка frontend reference: only `redesign-2026`.
- `origin/main` не изменять.
- Frontend source of truth: `app/`.
- `_reference/` remains source of truth where applicable.
- Existing WordPress target: `D:\OpenServer\domains\limitlesscreators`.
- Do not modify the WordPress installation without a specific implementation task.
- Production URLs from `https://limitlesscreators.ru/` must be preserved unless explicitly changed by the user.
- Existing redirects must be audited before changing them.
- Static breadcrumbs не перерабатывать без отдельного задания.
- В WordPress breadcrumbs выводятся через `rank_math_the_breadcrumbs()`.
- Portrait face/appearance нельзя изменять; protected portrait assets remain protected.
- `#bg_container.bg_container` and `canvas#gradient-canvas` remain protected shared art-system elements.
- Не считать существование файла признаком завершенности этапа: сверяться с Git history и фактическим состоянием.
- QA defaults to code-level verification. Browser QA / Playwright / screenshots are not automatic.
- QA artifacts сохранять до user review, кроме папок, которые пользователь явно разрешил удалить.

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

## Existing WordPress facts and unknowns

Confirmed:

- Existing WordPress local path: `D:\OpenServer\domains\limitlesscreators`.
- Existing production: `https://limitlesscreators.ru/`.
- This existing installation is the integration target.

To inspect and preserve where valid:

- redirects;
- content;
- CPT registrations;
- taxonomy registrations;
- ACF field groups/data;
- Rank Math configuration/data;
- plugin configuration;
- permalink/rewrite behavior;
- existing relations between posts/terms;
- other production business logic.

Do not state exact active theme, WordPress version, plugin list, ACF architecture, redirect plugin, number of WP records, database structure, theme folder name or site-plugin requirement before the audit.

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
