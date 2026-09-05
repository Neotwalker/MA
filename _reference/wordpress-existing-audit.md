# Existing WordPress Audit

Date: 2026-09-05

Scope: read-only audit of the existing local WordPress installation before integrating the approved static redesign.

Frontend reference repository: `C:\Users\and1m\Desktop\work\limitless-codex`

Existing WordPress target: `D:\OpenServer\domains\limitlesscreators`

Production site: `https://limitlesscreators.ru/`

## 1. Executive summary

Recommendation: **A. REUSE EXISTING WORDPRESS**.

Clean rebuild is not recommended from the facts found so far. The existing installation contains valuable production data and configuration: service records, taxonomy relations, case/article records, media, ACF field groups/data, Rank Math modules and redirects, Contact Form 7 forms, Flamingo submissions, WP menu data and URL history.

MUST PRESERVE:

- existing production URLs and redirect history;
- `services` records and their `service_category` / `service_tag` relations;
- `cases` and `articles` records;
- ACF field groups and existing field data;
- Rank Math titles/meta/schema/sitemap/redirect configuration;
- 30 active Rank Math 301 redirects;
- Contact Form 7 forms and Flamingo message history;
- media library and generated uploads;
- `Шапка` menu data;
- useful plugin configuration, including login protection, cache/CDN, SVG support and backup/migration tooling.

Current active theme: `limitlesscreators`.

Main architecture: the active theme is not only presentation. It currently registers core business content types and taxonomies, controls service permalink composition, registers the ACF options page, adjusts Rank Math breadcrumbs, hardcodes CF7 form rendering, owns case-service relationships, adds a reading-time shortcode and counts article views.

Key risk: switching directly from `limitlesscreators` to an empty new theme would likely break registration/routing/admin UI for `services`, `cases`, `articles`, `service_category`, `service_tag`, the `site-options` ACF options page, custom service term fields, case-service relations, breadcrumbs customization, reading time output, service category redirect and article view counts.

Main recommendation: keep the existing WordPress/database and plugin configuration, then separate long-lived business architecture from presentation before or during the new theme rollout. In particular, CPT/taxonomy registration and other durable business rules should be reviewed for a site-specific plugin instead of remaining accidentally tied to a presentation theme.

## 2. Environment

| Item | Finding |
| --- | --- |
| Local path | `D:\OpenServer\domains\limitlesscreators` |
| Production | `https://limitlesscreators.ru/` |
| WordPress version | `7.0.2` from `wp-includes/version.php` |
| Required PHP | `7.4` from `wp-includes/version.php` |
| Required MySQL | `5.5.5` from `wp-includes/version.php` |
| Available local PHP checked | OpenServer PHP `8.1.1` CLI |
| Table prefix | `lcs_` |
| WP project Git repository | No |
| Structure | `STANDARD / REVIEW` |

Standard WordPress directories and files are present: `wp-admin`, `wp-includes`, `wp-content`, `wp-config.php`, `.htaccess`, `uploads`, `themes`, `plugins`.

Review notes:

- `wp-content/mu-plugins` is not present.
- Root contains `x.php`, a 17-byte `phpinfo()` file. It was not changed. This is not normal production surface and should be reviewed before release.
- Root contains `old/`, which appears to be an older WordPress copy or migration snapshot. It was not audited deeply and should not be treated as active source.
- No full WordPress core checksum was performed. Based on targeted read-only inspection: **NO OBVIOUS CORE MODIFICATIONS FOUND / REVIEW REQUIRED**.
- Local configuration contains database connection constants and security constants. Values were not copied. **SECRET PRESENT / DO NOT EXPOSE**.

## 3. Themes

| Directory | Theme name | Version | Parent/child | Type | Notes |
| --- | --- | --- | --- | --- | --- |
| `limitlesscreators` | `LimitlessCreators` | `1.0.0` | Standalone | Custom | Active theme; owns current presentation and important business logic. |
| `twentytwentyfive` | `Twenty Twenty-Five` | `1.5` | Standalone | WordPress default | Installed fallback/default theme. |

Active theme data from WordPress options:

| Option | Value |
| --- | --- |
| `template` | `limitlesscreators` |
| `stylesheet` | `limitlesscreators` |

No child theme relationship was found for the active theme.

## 4. Active theme architecture

Active theme path:
`D:\OpenServer\domains\limitlesscreators\wp-content\themes\limitlesscreators`

Key top-level files:

| File | Responsibility |
| --- | --- |
| `functions.php` | Theme setup, assets, menu/sidebar registration, ACF options page, CPT/taxonomy registration, service permalinks, redirects, term admin fields, cases/articles registration, image settings, reading time, case-service admin relation, Rank Math breadcrumbs, admin CSS, article view counter. |
| `header.php` | Global header, ACF options, main menu, contact links, modal trigger structure, front-page image options. |
| `footer.php` | Footer, contact data from options/contact page, CF7 modal form, service category footer nav, scripts. |
| `page.php` | Main front page/default page composition with ACF blocks, services/cases/articles queries and footer form. |
| `single.php` | Single service template using ACF fields, related services, related cases, `the_content()` area and CF7 contact block. |
| `taxonomy-service_category.php` | Service taxonomy template using ACF term fields, service list, process/team/cases/FAQ blocks and CF7 contact block. |
| `archive.php` | Services archive template using service categories and services queries. |
| `archive-cases.php` | Cases archive with service/category filters and case cards. |
| `single-cases.php` | Single case template with ACF case fields. |
| `archive-articles.php` | Articles archive. |
| `single-articles.php` | Single article template with reading time. |
| `template-areaExpertise.php` | Service-tag/industry-style page template using service data and ACF service fields. |
| `template-contacts.php` | Contacts page template using ACF contact fields and options. |
| `template-faq.php` | FAQ page template using ACF fields and CF7 contact block. |
| `search.php`, `404.php`, `privacy.php` | Utility templates. |

Template parts:

- `template-parts/case-item-briefly.php`;
- `template-parts/content-none.php`;
- `template-parts/content-page.php`;
- `template-parts/content-search.php`;
- `template-parts/content.php`;
- `template-parts/cta-block.php`.

Theme includes:

- `inc/custom-header.php`;
- `inc/customizer.php`;
- `inc/jetpack.php`;
- `inc/template-functions.php`;
- `inc/template-tags.php`.

Important theme-level hooks found in `functions.php`:

- `register_nav_menus()` with menu location `menu-1` (`Шапка`);
- `register_sidebar()` with sidebar `sidebar-1`;
- `acf_add_options_page()` for `site-options`;
- `register_post_type()` for `services`, `cases`, `articles`;
- `register_taxonomy()` for `service_category`, `service_tag`;
- `post_type_link` filter for `%service_category%` service URLs;
- `template_redirect` redirect from `/service-category/` to `/services/`;
- service category term admin fields for thumbnail and order number;
- `add_image_size('custom-480', 480, 0, false)`;
- image quality filters and disabled big image threshold;
- `[reading_time]` shortcode;
- admin metabox and save hook for `cases` -> `services` relation stored as `related_service`;
- `rank_math/frontend/breadcrumb/items` filter;
- `template_redirect` article view counter storing `_lc_post_views`;
- `wpcf7_autop_or_not` filter;
- admin menu hiding for default posts/comments;
- frontend dequeues for block/global styles;
- emoji removal.

No theme-level `wp_ajax_`, `wp_ajax_nopriv_` or `register_rest_route()` was found in targeted PHP search.

## 5. Plugins

All installed plugin directories are currently active according to `active_plugins`. The serialized active list contains a duplicate Duplicator entry; do not fix during audit.

| Plugin | Active | Version | Role | Migration importance |
| --- | --- | --- | --- | --- |
| Advanced Custom Fields PRO | Yes | 6.2.7 | Structured field UI/data for options, services, front page, cases, service categories, FAQ. | High |
| Advanced Editor Tools | Yes | 5.9.2 | Classic editor/TinyMCE authoring UX. | Medium |
| Classic Editor | Yes | 1.7.0 | Keeps classic editor workflow. | Medium |
| Contact Form 7 | Yes | 6.1.6 | Main form engine. | High |
| Cyr-To-Lat | Yes | 7.0.2 | Slug transliteration. | Medium |
| Duplicator | Yes | 1.5.16.1 | Migration/backup tooling. | Medium |
| Flamingo | Yes | 2.6.2 | Stores CF7 submissions/contacts. | High |
| La Sentinelle antispam | Yes | 4.1.0 | Anti-spam and spam logs. | Medium |
| Rank Math SEO | Yes | 1.0.275 | SEO metadata, sitemap, schema, redirects, 404 monitor. | High |
| Regenerate Thumbnails | Yes | 3.1.6 | Media utility. | Low / Review |
| RSS for Yandex Turbo | Yes | 1.32 | Yandex Turbo RSS/feed logic. | Review |
| Super Page Cache | Yes | 5.3.2 | Cache/CDN integration. | Medium / High |
| SVG Support | Yes | 2.6.1 | SVG upload/display support. | Medium |
| UpdraftPlus | Yes | 1.26.6 | Backup/restore tooling. | Medium |
| WPCode Lite | Yes | 2.3.6 | Code snippets and header/footer code infrastructure. | High / Review |
| WPS Hide Login | Yes | 1.9.18 | Custom login URL / login protection. | High |

## 6. Custom / MU plugins

`wp-content/mu-plugins` is absent.

No clearly named site-specific custom plugin directory was found. Business content architecture is currently mostly in the active theme, not in a durable plugin layer.

Plugin-layer functionality that appears meaningful for migration:

- Contact Form 7 forms;
- Flamingo stored messages/contacts;
- Rank Math SEO, sitemap, schema, 404 monitor and redirects;
- WPCode snippets;
- WPS Hide Login settings;
- cache/CDN plugin configuration;
- backup/migration tooling;
- SVG support;
- Cyr-To-Lat slug handling.

WPCode records found:

| Status | Title | Notes |
| --- | --- | --- |
| `publish` | `Полностью отключить комментарии` | Active custom behavior outside the theme; preserve/review. |
| `draft` | `Метрика` | Draft analytics snippet; do not assume active. |
| `draft` | `Вк пиксель` | Draft tracking snippet; do not assume active. |
| `trash` | `Выводить сообщение после первого абзаца записи` | Legacy/trash; review only if needed. |

No snippet code was exported into this report.

## 7. Custom post types

| Post type | Count in DB | Owner / registration | Public | Publicly queryable | Has archive | Rewrite | Hierarchical | REST | Supports | Theme switch |
| --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `services` | 35 publish, 3 pending, 1 trash | Active theme `functions.php`, `limitless_register_custom_post_type()` | true | true | `services` | `services/%service_category%`, `with_front=false`, hierarchical | true | not set / likely false | title, editor, thumbnail, excerpt, custom-fields | THEME-DEPENDENT |
| `cases` | 18 publish | Active theme `functions.php`, `limitless_register_custom_post_type_cases()` | true | true | true | default / not explicitly set | true | not set / likely false | title, editor, thumbnail, excerpt, custom-fields | THEME-DEPENDENT |
| `articles` | 15 publish | Active theme `functions.php`, `limitless_register_custom_post_type_articles()` | true | true | true | default / not explicitly set | true | not set / likely false | title, editor, thumbnail, excerpt, custom-fields | THEME-DEPENDENT |
| `projects` | 1 publish | No active registration found in targeted theme/plugin search | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN / REVIEW |
| `wpcf7_contact_form` | 3 publish | Contact Form 7 plugin | plugin-defined | plugin-defined | plugin-defined | plugin-defined | plugin-defined | plugin-defined | plugin-defined | SAFE ON THEME SWITCH |
| `flamingo_contact` | 8 publish | Flamingo plugin | plugin-defined | plugin-defined | plugin-defined | plugin-defined | plugin-defined | plugin-defined | plugin-defined | SAFE ON THEME SWITCH |
| `flamingo_inbound` | 4 publish, 11 spam, 88 trash | Flamingo plugin | plugin-defined | plugin-defined | plugin-defined | plugin-defined | plugin-defined | plugin-defined | plugin-defined | SAFE ON THEME SWITCH |
| `la_sentinelle_log` | 200 draft | La Sentinelle plugin | plugin-defined | plugin-defined | plugin-defined | plugin-defined | plugin-defined | plugin-defined | plugin-defined | SAFE ON THEME SWITCH |
| `wpcode` | 1 publish, 2 draft, 1 trash | WPCode plugin | plugin-defined | plugin-defined | plugin-defined | plugin-defined | plugin-defined | plugin-defined | plugin-defined | SAFE ON THEME SWITCH |

## 8. Taxonomies

| Taxonomy | Terms / object count | Object types | Owner / registration | Public | Hierarchical | REST | Rewrite | Theme switch |
| --- | ---: | --- | --- | --- | --- | --- | --- | --- |
| `service_category` | 5 terms / 35 objects | `services` | Active theme `functions.php`, `limitless_register_taxonomies()` | default true | true | true | slug `services`, hierarchical, `with_front=false` | THEME-DEPENDENT |
| `service_tag` | 34 terms / 37 objects | `services` | Active theme `functions.php`, `limitless_register_taxonomies()` | default true | false | true | slug `service-area`, `with_front=false` | THEME-DEPENDENT |
| `service` | 1 term / stale count 1 | No active registration found | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN / LEGACY REVIEW |
| `nav_menu` | 1 term / 45 items | WP menus | WordPress core | Core | Core | Core | Core | SAFE, but menu location name is theme-dependent |
| `category` | 1 term / 0 objects | posts | WordPress core | Core | Core | Core | Core | SAFE |
| `flamingo_inbound_channel` | 4 terms / 4 objects | Flamingo | Flamingo plugin | plugin-defined | plugin-defined | plugin-defined | plugin-defined | SAFE ON THEME SWITCH |
| `wpcode_location`, `wpcode_tags`, `wpcode_type` | plugin terms | WPCode | WPCode plugin | plugin-defined | plugin-defined | plugin-defined | plugin-defined | SAFE ON THEME SWITCH |

`service_category -> services` and `service_tag -> services` are confirmed.

## 9. Services architecture

Confirmed current model:

- CPT: `services`;
- primary category taxonomy: `service_category`;
- industry/business tag taxonomy: `service_tag`;
- service archive: `/services/`;
- service taxonomy archive rewrite: `/services/{service_category}/`;
- single service rewrite: `/services/{service_category}/{service_slug}/`;
- `post_type_link` filter replaces `%service_category%` with the first assigned service category path.

Service categories:

| Term | Slug | Published services |
| --- | --- | ---: |
| Разработка | `development` | 24 |
| SEO-продвижение | `seo` | 11 |
| Брендинг | `branding` | 0 |
| Реклама | `reklama` | 0 |
| Готовые решения | `ready-made-sites` | 0 published, pending records exist |

`service_category` terms carry ACF-like term meta for taxonomy page content, Rank Math metadata, thumbnail and order number. The admin UI for `term-thumbnail` and `order_number` is currently registered by the active theme.

Theme-switch risk: the records stay in the database, but CPT/taxonomy admin UI, public routing, archive rendering and permalink generation are theme-dependent today.

## 10. Existing services mapping

Current permalink below uses the observed local permalink model. Preserve production URL history when implementing.

| WP ID | WP title | WP slug | Taxonomy | Current permalink | Frontend reference | Status |
| ---: | --- | --- | --- | --- | --- | --- |
| 4298 | 1С-Битрикс | `1s-bitriks` | development | `/services/development/1s-bitriks/` | `app/services-development-1s-bitriks.html` | MATCHED |
| 4303 | Joomla | `joomla` | development | `/services/development/joomla/` | `app/services-development-joomla.html` | MATCHED |
| 48 | Landing Page | `landing-page` | development | `/services/development/landing-page/` | `app/services-development-landing-page.html`; `app/services-single.html` is the approved reference | MATCHED |
| 4306 | Tilda | `tilda` | development | `/services/development/tilda/` | `app/services-development-tilda.html` | MATCHED |
| 4301 | Wordpress | `wordpress` | development | `/services/development/wordpress/` | `app/services-development-wordpress.html` | MATCHED |
| 4290 | Адаптивный | `adaptivnyj-sajt` | development | `/services/development/adaptivnyj-sajt/` | `app/services-development-adaptivnyj-sajt.html` | MATCHED |
| 4267 | Блог | `blog` | development | `/services/development/blog/` | `app/services-development-blog.html` | MATCHED |
| 4249 | Визитка | `vizitka` | development | `/services/development/vizitka/` | `app/services-development-vizitka.html` | MATCHED |
| 3479 | Дизайн сайта | `web-design` | development | `/services/development/web-design/` | `app/services-development-web-design.html` | MATCHED |
| 4276 | Для услуг | `uslugi` | development | `/services/development/uslugi/` | `app/services-development-uslugi.html` | MATCHED |
| 4261 | Доска объявлений | `doska-obyavlenij` | development | `/services/development/doska-obyavlenij/` | `app/services-development-doska-obyavlenij.html` | MATCHED |
| 56 | Интернет-магазин | `online-store` | development | `/services/development/online-store/` | `app/services-development-online-store.html` | MATCHED |
| 4287 | Информационный | `informaczionnyj` | development | `/services/development/informaczionnyj/` | `app/services-development-informaczionnyj.html` | MATCHED |
| 4273 | Каталог | `katalog` | development | `/services/development/katalog/` | `app/services-development-katalog.html` | MATCHED |
| 53 | Корпоративный | `corporate-website` | development | `/services/development/corporate-website/` | `app/services-development-corporate-website.html` | MATCHED |
| 4279 | Личный | `lichnyj` | development | `/services/development/lichnyj/` | `app/services-development-lichnyj.html` | MATCHED |
| 3252 | Маркетплейс | `marketplace` | development | `/services/development/marketplace/` | `app/services-development-marketplace.html` | MATCHED |
| 4282 | Многостраничный | `mnogostranichnyj` | development | `/services/development/mnogostranichnyj/` | `app/services-development-mnogostranichnyj.html` | MATCHED |
| 4294 | Мобильная версия | `mobilnaya-versiya` | development | `/services/development/mobilnaya-versiya/` | `app/services-development-mobilnaya-versiya.html` | MATCHED |
| 4285 | Нестандартный | `nestandartnyj` | development | `/services/development/nestandartnyj/` | `app/services-development-nestandartnyj.html` | MATCHED |
| 3249 | Портал | `internet-portal` | development | `/services/development/internet-portal/` | `app/services-development-internet-portal.html` | MATCHED |
| 4264 | Портфолио | `portfolio` | development | `/services/development/portfolio/` | `app/services-development-portfolio.html` | MATCHED |
| 3245 | Промо | `razrabotka-promo-sajta` | development | `/services/development/razrabotka-promo-sajta/` | `app/services-development-promo-site.html` | PROBABLE MATCH / REVIEW |
| 4270 | Форум | `forum` | development | `/services/development/forum/` | `app/services-development-forum.html` | MATCHED |
| 4328 | Продвижение в Google | `prodvizhenie-v-google` | seo | `/services/seo/prodvizhenie-v-google/` | `app/services-seo-prodvizhenie-v-google.html` | MATCHED |
| 4330 | Продвижение в Яндексе | `prodvizhenie-v-yandex` | seo | `/services/seo/prodvizhenie-v-yandex/` | `app/services-seo-prodvizhenie-v-yandex.html` | MATCHED |
| 4332 | Продвижение интернет-магазина | `prodvizhenie-internet-magazina` | seo | `/services/seo/prodvizhenie-internet-magazina/` | `app/services-seo-prodvizhenie-internet-magazina.html` | MATCHED |
| 4334 | Продвижение корпоративного сайта | `prodvizhenie-korporativnogo-sajta` | seo | `/services/seo/prodvizhenie-korporativnogo-sajta/` | `app/services-seo-prodvizhenie-korporativnogo-sajta.html` | MATCHED |
| 4337 | Продвижение лендинга | `prodvizhenie-lendinga` | seo | `/services/seo/prodvizhenie-lendinga/` | `app/services-seo-prodvizhenie-lendinga.html` | MATCHED |
| 4341 | Продвижение молодого сайта | `prodvizhenie-molodogo-sajta` | seo | `/services/seo/prodvizhenie-molodogo-sajta/` | `app/services-seo-prodvizhenie-molodogo-sajta.html` | MATCHED |
| 4317 | Продвижение по лидам | `prodvizhenie-po-lidam` | seo | `/services/seo/prodvizhenie-po-lidam/` | `app/services-seo-prodvizhenie-po-lidam.html` | MATCHED |
| 4309 | Продвижение по позициям | `prodvizhenie-po-pozicziyam` | seo | `/services/seo/prodvizhenie-po-pozicziyam/` | `app/services-seo-prodvizhenie-po-pozicziyam.html` | MATCHED |
| 4313 | Продвижение по трафику | `prodvizhenie-po-trafiku` | seo | `/services/seo/prodvizhenie-po-trafiku/` | `app/services-seo-prodvizhenie-po-trafiku.html` | MATCHED |
| 4339 | Продвижение портала | `prodvizhenie-portala` | seo | `/services/seo/prodvizhenie-portala/` | `app/services-seo-prodvizhenie-portala.html` | MATCHED |
| 4343 | Региональное продвижение | `regionalnoe-prodvizhenie` | seo | `/services/seo/regionalnoe-prodvizhenie/` | `app/services-seo-regionalnoe-prodvizhenie.html` | MATCHED |
| 2368 | Готовое решение по клинингу | `professionalnaya_uborka_klining` | ready-made-sites | pending | No current approved product page | NO STATIC MATCH |
| 2602 | Готовое решение по продаже сантехники и плитки | `gotovoe-reshenie-po-prodazhe-santehniki-i-plitki` | ready-made-sites | pending | No current approved product page | NO STATIC MATCH |
| 2376 | Контекстная реклама | `kontekstnaya-reklama` | reklama | pending | No exact Reklama static page | NO STATIC MATCH |
| 4315 | Продвижение по лидам | `__trashed` | none | trash | `app/services-seo-prodvizhenie-po-lidam.html` maps to published ID 4317 | NO STATIC MATCH / TRASH |

Static pages without matching published WP service records:

- `app/services-development-dorabotka-sajta.html`;
- `app/services-branding-logotip.html`;
- `app/services-branding-firmennyj-stil.html`;
- `app/services-branding-brendbuk.html`;
- `app/services-branding-ajdentika.html`;
- `app/services-reklama-yandex-direct.html`;
- `app/services-reklama-reklama-vkontakte.html`;
- `app/services-reklama-retargeting.html`;
- `app/services-reklama-audit-reklamy.html`;
- `app/services-reklama-dorabotka-posadochnoj.html`;
- `app/services-reklama-analitika-obrashhenij.html`;
- `app/services-readysites-arenda-avto.html`.

## 11. Ready Sites

Current WP: separate Ready Sites model is not confirmed.

Found:

- `service_category` term `ready-made-sites`;
- 2 pending `services` records under that term;
- no separate Ready Sites CPT found in active theme/plugin search;
- no published WordPress page for the approved new `/ready-made-sites/` namespace was found in the page list;
- Rank Math redirects include a legacy ready-made-sites path pattern.

Approved future frontend architecture remains:

- `/ready-made-sites/`;
- `/ready-made-sites/arenda-avto/`;
- planned later: `/ready-made-sites/karkasnye-doma/`.

Do not treat old `/services/ready-made-sites/` or current pending service records as the final production architecture. After this audit, decide separately whether Ready Sites should be implemented as pages, a CPT, a taxonomy-backed model or another explicit architecture.

## 12. ACF architecture

ACF plugin: Advanced Custom Fields PRO `6.2.7`.

ACF storage: **DB/admin**.

`acf-json`: not found under `wp-content`.

PHP field registration: no project-level `acf_add_local_field_group()` found in active theme or custom code search.

Options page: `site-options`, registered in active theme via `acf_add_options_page()`.

Field groups in DB:

| Group | Location | Field count | Main field types | Migration risk |
| --- | --- | ---: | --- | --- |
| Общие настройки | options page `site-options` | 14 | tabs, image, text, textarea | Data exists in DB; options page registration is THEME-DEPENDENT |
| Услуга | post type `services` | 14 | tabs, textarea, text, image, repeater | Depends on `services` registration and ACF plugin |
| Главная | front page | 23 | tabs, text, textarea, repeater, image | Depends on page/front-page mapping and template use |
| Контакты | `template-contacts.php` | 4 | text, image, group | Depends on page template availability |
| Кейс | post type `cases` | 15 | tabs, text, repeater, image, wysiwyg | Depends on `cases` registration |
| Категория услуг | taxonomy `service_category` | 21 | tabs, text, textarea, image, repeater, wysiwyg | Depends on `service_category` registration |
| FAQ | `template-faq.php` | 3 | text, textarea, repeater | Depends on page template availability |

ACF data risk:

- Field groups stored in DB should survive a theme switch if ACF remains active.
- ACF options page `site-options` will disappear from admin if the new theme does not register it or it is not moved to a durable plugin layer.
- Field groups tied to current page templates may need location-rule migration if the new theme uses different template filenames.
- Field groups tied to `services`, `cases` and `service_category` depend on those object types remaining registered.

## 13. WordPress content

Content counts:

| Type | Status/count |
| --- | ---: |
| pages | 4 published |
| posts | no published default posts found |
| services | 35 published, 3 pending, 1 trash |
| cases | 18 published |
| articles | 15 published |
| projects | 1 published, legacy/unknown registration |
| media attachments | 226 |
| CF7 forms | 3 published |
| Flamingo contacts/messages | 8 contacts, 4 published inbound, 11 spam, 88 trash |
| WPCode snippets | 1 published, 2 draft, 1 trash |
| La Sentinelle logs | 200 draft |
| nav menu items | 45 published |

Published pages:

| ID | Title | Slug | Template |
| ---: | --- | --- | --- |
| 2 | Главная | `main` | default; assigned as front page |
| 3 | Политика конфиденциальности | `privacy-policy` | `privacy.php` |
| 35 | Контакты | `contacts` | `template-contacts.php` |
| 4123 | FAQ | `faq` | `template-faq.php` |

Front page setting:

- `show_on_front`: page;
- front page ID: 2;
- posts page: not assigned.

Uploads have year/month folders for 2024, 2025 and 2026 plus plugin folders for Rank Math, Smush, CF7 uploads, WPCode and WPForms.

## 14. URLs and rewrites

Permalink structure:

```text
/%category%/%postname%/
```

Important URL architecture found:

- `services` archive uses `/services/`;
- `service_category` uses `/services/{term}/`;
- single services use `/services/{service_category}/{service_slug}/` via `post_type_link` filter;
- `service_tag` uses `/service-area/{term}/`;
- `cases` and `articles` are CPTs with default rewrite behavior from registration;
- static frontend filenames are references, not production URL authority.

Production URL preservation remains mandatory. Do not normalize or replace legacy slugs by intuition. Existing redirects must be preserved or consciously migrated to an appropriate durable location.

## 15. Redirect architecture

| Redirect source | Exists | Active/relevant | Notes |
| --- | --- | --- | --- |
| Rank Math redirections | Yes | Yes | 30 active `301` redirects in `lcs_rank_math_redirections`; keep/migrate as durable SEO infrastructure. |
| Active theme PHP | Yes | Yes | `redirect_old_service_category()` redirects `/service-category/` to `/services/`; theme-dependent and should move to durable layer or be replaced by Rank Math/server redirect after review. |
| `.htaccess` | Yes | Standard WP only | Contains WordPress rewrite block; no custom redirects found. Duplicator update comment present. |
| Dedicated Redirection plugin | Not installed | No | No Redirection plugin directory found. |
| WPCode | Yes | Review | One published snippet disables comments; draft analytics snippets exist. No redirect snippet content was exported. |
| Server/OpenServer config | Not audited | Review only if needed | No server config changes were made. |

Rank Math redirection sample shows legacy service URL redirects, including service path normalization and old article slug redirects. Do not export or rewrite the full list in theme code unless a later migration plan explicitly says so.

## 16. Rank Math

Rank Math SEO is active.

Confirmed modules include:

- link counter;
- analytics;
- SEO analysis;
- sitemap;
- rich-snippet/schema;
- ACF;
- local SEO;
- 404 monitor;
- redirections;
- instant indexing;
- Content AI / AI visibility;
- plus compatibility modules listed in the option.

Rank Math data tables found:

- `lcs_rank_math_404_logs` with 3131 records;
- `lcs_rank_math_internal_links` with 101 records;
- `lcs_rank_math_internal_meta` with 92 records;
- `lcs_rank_math_redirections` with 30 active redirects;
- `lcs_rank_math_redirections_cache` with 34 records.

Theme integration:

- `rank_math_the_breadcrumbs()` is used in templates;
- `rank_math/frontend/breadcrumb/items` filter customizes service breadcrumbs.

Migration implication: keep Rank Math active and preserve its DB data. New theme must continue breadcrumb output through Rank Math and reproduce or deliberately relocate the breadcrumb customization.

## 17. Forms

Form stack:

- Contact Form 7 active;
- Flamingo active;
- La Sentinelle antispam active;
- no test submissions were sent.

CF7 forms:

| ID | Title | Slug | Status |
| ---: | --- | --- | --- |
| 8 | Модальная форма | `kontaktnaya-forma-1` | publish |
| 19 | Форма в подвале | `modalnaya-forma_copy` | publish |
| 47 | Бриф | `brif` | publish |

Theme usage:

- footer renders the modal form through a hardcoded CF7 shortcode;
- homepage/page/service/case/taxonomy/contact/FAQ templates render the footer/contact form through hardcoded CF7 shortcodes;
- theme disables CF7 automatic paragraph wrapping with `wpcf7_autop_or_not`.

No CF7 shortcodes were found inside published post/page content by DB search, so the forms are template-dependent in current rendering even though the form definitions themselves live in the plugin.

Migration implication: preserve CF7 form records and Flamingo data; new theme must provide equivalent form placements or intentionally replace the form stack after a separate decision.

## 18. Navigation / menus

Registered theme menu location:

| Location | Label | Owner |
| --- | --- | --- |
| `menu-1` | `Шапка` | active theme |

Existing WP menu:

| Menu | Slug | Items |
| --- | --- | ---: |
| `Шапка` | `shapka` | 45 |

Theme mods assign `menu-1` to menu ID 5.

Menu items include pages, service archive/taxonomy items, service single items, cases archive-like items and articles archive-like items. Some menu object IDs are negative, which likely represent post type archive menu entries and should be reviewed during template migration.

Migration implication: menu data survives in the DB, but the new theme must register a compatible menu location or deliberately map old location data to new locations.

## 19. Theme-dependent business logic

High-priority theme-dependent functionality:

- CPT registration for `services`, `cases`, `articles`;
- taxonomy registration for `service_category`, `service_tag`;
- `services` URL construction through `%service_category%` and `post_type_link`;
- `/service-category/` -> `/services/` redirect;
- ACF options page `site-options`;
- custom term admin fields/meta for `service_category`: thumbnail and order;
- case-service relationship admin metabox storing `related_service`;
- Rank Math breadcrumb customization;
- CF7 shortcode placements in templates and CF7 autop filter;
- `[reading_time]` shortcode used in article templates;
- article view counter storing `_lc_post_views`;
- menu location `menu-1`;
- sidebar `sidebar-1`;
- image size `custom-480` and image quality/big-image behavior;
- admin menu hiding for posts/comments;
- frontend dequeue of block/global styles;
- theme template files for current content display.

Likely presentation legacy:

- old theme CSS/JS assets and layout-specific markup;
- old static visual composition in templates;
- front-end animation/menu/modal implementation that will be replaced by approved static redesign logic.

Review:

- `projects` post type and `service` taxonomy are present in DB but no active registration was found;
- root `old/` copy and `x.php` need security/release review;
- WPCode snippets should be reviewed without exposing code/secrets.

## 20. Functionality safe outside theme

Likely safe across a theme switch, if plugins remain active:

- WordPress database content and media;
- ACF field groups stored in DB;
- Contact Form 7 form definitions;
- Flamingo contacts/messages;
- Rank Math metadata, sitemap settings, schema settings, 404 logs and redirects;
- WPCode plugin snippets/settings;
- WPS Hide Login settings;
- cache/CDN plugin settings;
- SVG support plugin behavior;
- backup/migration plugin data.

Important caveat: plugin data may survive in the database, but templates, locations or object-type registrations that expose that data may still be theme-dependent.

## 21. Theme-switch risk matrix

| Functionality | Current owner | Survives theme switch | Recommended future owner | Risk |
| --- | --- | --- | --- | --- |
| `services` CPT registration | Active theme | No | SITE-SPECIFIC PLUGIN or REVIEW | CRITICAL |
| `service_category` taxonomy | Active theme | No | SITE-SPECIFIC PLUGIN or REVIEW | CRITICAL |
| `service_tag` taxonomy | Active theme | No | SITE-SPECIFIC PLUGIN or REVIEW | CRITICAL |
| `cases` CPT registration | Active theme | No | SITE-SPECIFIC PLUGIN or REVIEW | HIGH |
| `articles` CPT registration | Active theme | No | SITE-SPECIFIC PLUGIN or REVIEW | HIGH |
| Service permalink category substitution | Active theme | No | SITE-SPECIFIC PLUGIN or NEW THEME after URL decision | CRITICAL |
| Service category legacy redirect | Active theme | No | Rank Math / server redirect / SITE-SPECIFIC PLUGIN | HIGH |
| Rank Math redirects | Rank Math plugin + DB | Yes if plugin active | EXISTING PLUGIN | HIGH preserve |
| Rank Math breadcrumb output | Templates + Rank Math | Plugin data survives; output does not | NEW THEME | HIGH |
| Rank Math breadcrumb customization | Active theme | No | NEW THEME or SITE-SPECIFIC PLUGIN | HIGH |
| ACF field groups | ACF DB/admin | Yes if ACF active | EXISTING PLUGIN / DB, optionally managed later | HIGH preserve |
| ACF `site-options` page | Active theme | No | SITE-SPECIFIC PLUGIN or NEW THEME | HIGH |
| ACF fields tied to template filenames | ACF DB/admin + current theme templates | Partially | REVIEW | MEDIUM |
| CF7 form records | CF7 plugin | Yes if plugin active | EXISTING PLUGIN | HIGH preserve |
| CF7 template placements | Active theme | No | NEW THEME | HIGH |
| CF7 autop filter | Active theme | No | NEW THEME or SITE-SPECIFIC PLUGIN | MEDIUM |
| Flamingo submissions | Flamingo plugin | Yes if plugin active | EXISTING PLUGIN | HIGH preserve |
| Case-service relation metabox | Active theme | No | SITE-SPECIFIC PLUGIN or NEW THEME | HIGH |
| `related_service` data | postmeta DB | Yes, but UI/query depends on owner | SITE-SPECIFIC PLUGIN / NEW THEME | HIGH |
| Reading time shortcode | Active theme | No | SITE-SPECIFIC PLUGIN or NEW THEME | MEDIUM |
| Article view counter | Active theme | No | SITE-SPECIFIC PLUGIN or REVIEW | MEDIUM |
| Menu data | WordPress DB | Yes | WORDPRESS CORE/API | MEDIUM |
| Menu location `menu-1` | Active theme | No | NEW THEME mapping | MEDIUM |
| Custom image size `custom-480` | Active theme | No | NEW THEME or REVIEW | MEDIUM |
| WPCode snippets | WPCode plugin | Yes if plugin active | EXISTING PLUGIN / REVIEW | MEDIUM |
| Login protection | WPS Hide Login | Yes if plugin active | EXISTING PLUGIN | HIGH preserve |
| Cache/CDN behavior | Super Page Cache | Yes if plugin active | EXISTING PLUGIN / REVIEW | MEDIUM |
| Root `x.php` | File in WP root | Yes unless removed later | REVIEW | MEDIUM security/release |

## 22. Reuse matrix

| Existing component/data | Keep | Refactor | Replace | Review | Reason |
| --- | --- | --- | --- | --- | --- |
| Existing WordPress DB | Yes | No | No | No | Contains production content, relations, SEO data and form data. |
| Existing service records | Yes | Map | No | Yes | Many match static references and preserve URLs. |
| Existing service taxonomy terms | Yes | Map | No | Yes | Required for current service URLs and navigation. |
| Existing service tag terms | Yes | Map | No | Yes | Likely useful for industry pages and related services. |
| Existing ACF field groups/data | Yes | Possibly | No | Yes | Useful content model; may need location/name cleanup after architecture decision. |
| Existing Rank Math data | Yes | Possibly | No | Yes | SEO/redirect infrastructure should be preserved. |
| Existing redirects | Yes | Possibly | No | Yes | URL history. Move theme redirect out of theme if needed. |
| Existing CF7 forms | Yes | Possibly | No | Yes | Known form stack with stored submissions through Flamingo. |
| Existing media library | Yes | Possibly | No | Yes | Required by content and ACF image fields. |
| Existing active theme presentation | No | Use as reference only where needed | Yes | Yes | New approved frontend should replace old UI. |
| Existing theme business logic | No as-is | Yes | No | Yes | Durable logic should not disappear on theme switch. |
| Existing plugins | Mostly yes | Some settings review | No | Yes | Several plugins hold production infrastructure. |
| `projects` post type data | Unknown | Unknown | No now | Yes | Legacy/unknown; do not delete before decision. |
| `old/` folder and root `x.php` | No production reliance assumed | No | Later only after decision | Yes | Potential legacy/security cleanup, not part of integration now. |

## 23. Main migration risks

CRITICAL:

- Directly switching to a blank/new theme would unregister `services`, `service_category` and `service_tag`, breaking service admin UI, public URLs and taxonomy archives.
- Service URL generation depends on theme code replacing `%service_category%`.
- Existing Rank Math redirects and current production URL history must not be lost or duplicated incorrectly.

HIGH:

- `cases` and `articles` CPTs are theme-dependent.
- ACF options page `site-options` is theme-dependent.
- Case-service relationships are managed by a theme metabox.
- CF7 forms are plugin data but their placements are hardcoded in theme templates.
- Rank Math breadcrumb customization is theme-dependent.
- Branding/Reklama/Ready Sites static references do not yet have matching published WP service records.

MEDIUM:

- Custom image size and image quality behavior are theme-dependent.
- Menu location mapping is theme-dependent.
- `[reading_time]` shortcode and article view counter are theme-dependent.
- `projects` and legacy `service` taxonomy need review.
- Root `x.php` and `old/` folder should be reviewed before release.

LOW:

- Default widgets/sidebar exist but appear low business importance unless new architecture uses them.
- Regenerate Thumbnails is utility-only unless image-size migration later requires it.

## 24. Proposed integration direction

Recommended direction, not implementation:

```text
existing WordPress + existing database
-> preserve production data/configuration
-> keep useful plugins active while auditing responsibilities
-> separate theme-dependent business architecture where justified
-> move long-lived CPT/taxonomy/permalink/relationship registration to durable layer if approved
-> create a new presentation theme after architecture approval
-> integrate approved frontend template-by-template
-> map existing records/terms/ACF data to the new templates
-> preserve legacy production URLs and redirects
-> implement Ready Sites with its approved /ready-made-sites/ namespace after model decision
-> validate generated WordPress templates with W3C/Nu checker
-> run accessibility, performance and rewrite/redirect QA
-> production release only after final migration checks
```

Likely future owner guidance:

- CPT/taxonomy registration: site-specific plugin preferred, or explicit architecture review if kept in theme.
- Presentation templates/components/assets: new theme.
- Rank Math redirects/meta/schema/sitemap: existing Rank Math plugin.
- CF7 form definitions and Flamingo data: existing plugins; placements in new theme.
- ACF field groups: preserve DB/admin initially; consider managed PHP/JSON only after architecture decision.
- Ready Sites: separate decision required, with approved root namespace `/ready-made-sites/`.

## 25. Questions requiring user decision

1. Should long-lived content architecture (`services`, `cases`, `articles`, `service_category`, `service_tag`, service permalink logic) be moved to a site-specific plugin before the new theme switch?
2. Should the `site-options` ACF options page live in the new theme or in a site-specific plugin?
3. How should Ready Sites be modeled in WordPress: pages, a dedicated CPT, existing `services` with custom rewrites, or another explicit model?
4. Should pending legacy ready-made-site services be preserved as drafts/pending legacy records, migrated into the new Ready Sites model, or removed later after a separate decision?
5. Should Branding and Reklama static service pages become new WP `services` records, and what exact production URLs should they use?
6. Should the `projects` post type record and legacy `service` taxonomy be migrated, ignored, or removed later after confirmation?
7. Should the active WPCode snippets remain the source for disabling comments/analytics, or should those responsibilities move into plugin/theme/config after review?
8. Should the root `x.php` and `old/` folder be removed before production release after a separate safety review?

Final conclusion: **A. REUSE EXISTING WORDPRESS**.

Reason: the audit found useful production content/configuration and no concrete technical reason that justifies a clean rebuild. The main risk is not the existing WordPress itself; the risk is business architecture currently tied to the old presentation theme.
