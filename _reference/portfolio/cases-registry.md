# Реестр production-кейсов

Дата фиксации: 2026-08-01.

Источник: production-архив `https://limitlesscreators.ru/cases/`, production-страницы отдельных кейсов и подтверждённый контекст проекта. Этот файл фиксирует рабочий реестр для переноса в будущую WordPress-модель портфолио. Он не является готовым публичным текстом для сайта.

## Общие правила

- Production-архив сохраняется на `/cases/`, но в интерфейсе называется «Портфолио».
- Существующие 18 URL `/cases/{slug}/` сохраняются без переименования.
- Общие и технически неидеальные slug не переименовываются на первом этапе.
- Существующий редирект `/cases/open-log/` -> `/cases/open-logistics/` сохраняется.
- Новые legacy-редиректы не создаются без подтверждённых внешних ссылок, аналитики, Search Console или истории сайта.
- `archive-case.html` и `single-case.html` остаются статическими прототипами, а не production URL.
- Все проекты выполнены лично Маратом Абзаловым. Различается только объём и формат выполненных работ.
- Limitless Creators — прежнее название и обозначение работы самого Марата Абзалова, а не отдельное агентство, команда или сторонний исполнитель.
- Старые формулировки «мы разработали», «наша команда», «агентство» и «Limitless Creators» в кейсах нужно переписывать от первого лица или нейтрально как работу Марата.
- Для каждого проекта обязательно показывать конкретную роль Марата. Нельзя ставить под сомнение его участие только из-за старого текста от лица «мы».
- Пустые поля, неподтверждённые метрики, проценты, бюджеты, стоимость лида, трафик, конверсия, PageSpeed и другие измеримые результаты не выводятся публично.

## Статусы

- `confirmed` — состав работ понятен из production-кейса или ранее подтверждён пользователем.
- `partially-confirmed` — проект точно выполнен Маратом, но некоторые детали состава работ сформулированы неоднозначно.
- `requires-user-confirmation` — используется только если невозможно определить конкретный объём работ, а не факт участия Марата.
- `concept` — тип проекта или статус запуска, а не сомнение в авторстве.
- `promotion-case` — тип кейса про продвижение или рекламу, а не сомнение в авторстве.

Числовые показатели подтверждаются отдельно. Production-страница может подтверждать состав работ, но не делает автоматически подтверждёнными проценты, стоимость лида, бюджеты, показатели трафика, конверсии, PageSpeed и другие измеримые результаты.

## Фильтры архива

На первом этапе используются только UI-фильтры без публичных индексируемых URL:

- Все проекты
- Корпоративные сайты
- Каталоги и интернет-магазины
- Сервисы и платформы
- Продвижение
- Другие работы

## Реестр

### 1. Brick Pic

- Production URL: `https://limitlesscreators.ru/cases/brick-pic/`
- Slug: `brick-pic`
- Public title: `Brick Pic`
- Material type: подробный кейс интернет-магазина с онлайн-конструктором
- Publication status: `confirmed`
- Archive filter category: `Каталоги и интернет-магазины`
- Confirmed year: 2024-2025
- Actual Marat role: структура, визуальная система, пользовательский сценарий, интерфейс онлайн-конструктора, доработка Bitrix24-шаблона, корзина, заказ, онлайн-оплата и интеграция с CRM Bitrix24
- Confirmed work: интернет-магазин персонализированных рамок с онлайн-конструктором персонажей, настройкой рамки и композиции, передачей заказа в корзину, сохранением загруженных изображений, уведомлениями и CRM-интеграцией
- Confirmed tech: Bitrix24 site builder, CRM Bitrix24, онлайн-оплата, кастомная логика конструктора
- Claims not to make: не утверждать неподтверждённые продажи, конверсию, трафик, рекламные результаты, PageSpeed или финансовый эффект
- Allowed numeric indicators: только годы 2024-2025; измеримых результатов нет
- Unconfirmed metrics: продажи, заказы, конверсия, трафик, средний чек, скорость и рекламные показатели
- Available materials: production URL; локальные изображения `app/img/cases/brick-pik/`; логотип `app/img/companies/brick-pic.png`
- Detailed single-case needed: да
- First-release readiness: готов к подробному кейсу без неподтверждённых метрик
- User questions: какие измеримые результаты можно подтверждать публично и можно ли раскрывать детали онлайн-оплаты и CRM-сценария

### 2. Clean Service

- Production URL: `https://limitlesscreators.ru/cases/clean-service/`
- Slug: `clean-service`
- Public title: `Clean Service`
- Material type: кейс разработки и продвижения
- Publication status: `promotion-case`
- Archive filter category: `Продвижение`
- Confirmed year: 2024
- Actual Marat role: структура, прототип, дизайн, тексты, WordPress-разработка, формы, аналитика, базовая SEO-подготовка, посадочные страницы, сопровождение и работа с Яндекс Директ
- Confirmed work: корпоративный сайт с посадочными страницами услуг, рекламным продвижением, аналитикой звонков, форм и переходов в мессенджеры, региональным расширением на Челябинск и сопровождением
- Confirmed tech: WordPress, кастомная тема, формы, Яндекс Метрика, Яндекс Директ, sitemap, метаданные
- Claims not to make: не использовать неподтверждённые проценты, бюджеты, SEO-рост, трафик, конверсию и финансовые результаты
- Allowed numeric indicators: год 2024; стоимость лида 800-950 ₽ как ранее подтверждённый пользователем диапазон
- Unconfirmed metrics: 2144 ₽, 87%, бюджеты, трафик, SEO-показатели, конверсия и любые дополнительные показатели без отдельного подтверждения
- Available materials: production URL; локальные изображения `app/img/cases/clean/`, `app/img/cases/clean-service.png`, `app/img/cases/clean-service-min.png`; логотип `app/img/companies/clean-service.svg`
- Detailed single-case needed: да, с ясным разделением разработки сайта и рекламного продвижения
- First-release readiness: готов к осторожной публикации с подтверждённым диапазоном стоимости лида
- User questions: какие периоды, бюджеты, цели кампаний и итоговые показатели можно раскрывать публично

### 3. Elheater

- Production URL: `https://limitlesscreators.ru/cases/elheater/`
- Slug: `elheater`
- Public title: `Elheater`
- Material type: концепт каталога
- Publication status: `concept`
- Archive filter category: `Каталоги и интернет-магазины`
- Confirmed year: 2025
- Actual Marat role: структура, дизайн, тексты, вёрстка, адаптив, WordPress, каталог, импорт, поиск, фильтры, формы и SEO-подготовка
- Confirmed work: демонстрационный концепт незавершённого клиентского проекта; многоязычный корпоративный каталог теплового оборудования на WooCommerce без онлайн-оплаты, с запросом коммерческого предложения
- Confirmed tech: WordPress, WooCommerce, Polylang, EN/DE, Excel/CSV import, AJAX search, filters, forms
- Claims not to make: не утверждать запуск клиентом, продажи, SEO-рост, рекламу, коммерческие результаты или действующий интернет-магазин с оплатой
- Allowed numeric indicators: год 2025; измеримых результатов нет
- Unconfirmed metrics: продажи, заявки, трафик, конверсия, количество товаров, скорость и финансовый эффект
- Available materials: production URL; локальные изображения `app/img/cases/elheater/`; логотип `app/img/companies/elheater.svg`
- Detailed single-case needed: да, только с явной маркировкой концепта
- First-release readiness: готов как концепт с подтверждённым составом работ
- User questions: можно ли публично раскрывать причину незавершённого запуска и какие элементы каталога были наполнены демо-данными

### 4. Expert Service

- Production URL: `https://limitlesscreators.ru/cases/expert-service/`
- Slug: `expert-service`
- Public title: `Expert Service`
- Material type: подробный кейс разработки
- Publication status: `confirmed`
- Archive filter category: `Корпоративные сайты`
- Confirmed year: 2026
- Actual Marat role: структура, дизайн, тексты, frontend, WordPress, ACF, формы, квиз, техническая SEO-подготовка, запуск и последующая поддержка
- Confirmed work: корпоративный сайт строительной компании с каталогом услуг, кейсами, FAQ, видео, квизом, несколькими сценариями обращения, аналитикой, политикой конфиденциальности и рабочей версией на основном домене
- Confirmed tech: WordPress, ACF, Contact Form 7, Rank Math, quiz, analytics
- Claims not to make: не утверждать неподтверждённые бизнес-результаты, рост SEO, рекламные показатели и состав команды
- Allowed numeric indicators: год 2026; измеримых результатов нет
- Unconfirmed metrics: заявки, позиции, трафик, конверсия, скорость, финансовые показатели
- Available materials: production URL; локальные изображения `app/img/cases/expert service/`
- Detailed single-case needed: да
- First-release readiness: готов к первому релизу после редакции текста без неподтверждённых результатов
- User questions: можно ли подтверждать сроки, результаты поддержки и конкретные показатели после запуска

### 5. Funtech

- Production URL: `https://limitlesscreators.ru/cases/funtech/`
- Slug: `funtech`
- Public title: `Funtech`
- Material type: подробный кейс разработки
- Publication status: `confirmed`
- Archive filter category: `Корпоративные сайты`
- Confirmed year: 2023
- Actual Marat role: адаптивная вёрстка по дизайну клиента, собственная тема WordPress, ACF, управляемые проекты и новости, RU/EN-версии, формы, анимации, аналитика, SEO-подготовка, deploy и запуск
- Confirmed work: корпоративный сайт для агентства интерактивных технологий с управляемым портфолио, новостями, отзывами, отдельными шаблонами проектов и публикаций, мультиязычностью и формами обратной связи
- Confirmed tech: WordPress, custom theme, ACF, custom post types, Polylang, Contact Form 7, Yandex Metrika, Google Analytics
- Claims not to make: не утверждать дизайн, если в публичном тексте не указано, что дизайн был предоставлен клиентом; не использовать неподтверждённые результаты и бюджет
- Allowed numeric indicators: год 2023; измеримых результатов нет
- Unconfirmed metrics: бюджет, трафик, заявки, конверсия, скорость и бизнес-результаты
- Available materials: production URL; логотипы `app/img/companies/funtech.svg` и `app/img/projects/funtech.svg`
- Detailed single-case needed: да
- First-release readiness: готов к подробному кейсу с акцентом на WordPress-интеграцию и управляемые разделы
- User questions: можно ли раскрывать сроки, объём поддержки и любые измеримые результаты

### 6. Moment Delivery

- Production URL: `https://limitlesscreators.ru/cases/moment-dostavki/`
- Slug: `moment-dostavki`
- Public title: `Moment Delivery`
- Material type: подробный кейс веб-сервиса
- Publication status: `confirmed`
- Archive filter category: `Сервисы и платформы`
- Confirmed year: разработка 2025, запуск 2026
- Actual Marat role: фирменный стиль, логотип, прототипы, дизайн, тексты, frontend, backend, интеграции, публичный сайт, личный кабинет, административный контур, deploy и поддержка
- Confirmed work: веб-сервис международной доставки с регистрацией, Telegram-авторизацией, личным кабинетом, получателями, адресами, документами, калькулятором доставки, заказами, оплатой, трекингом, кошельком, уведомлениями и административными инструментами
- Confirmed tech: Vue, Telegram authorization and notifications, online payment, tracking, user account, admin panel
- Claims not to make: не использовать неподтверждённые показатели заказов, оборота, конверсии, трафика, скорости и финансового эффекта
- Allowed numeric indicators: годы 2025 и 2026; измеримых результатов нет
- Unconfirmed metrics: количество пользователей, заказов, платежей, трафик, конверсия, скорость и финансовые показатели
- Available materials: production URL; локальные изображения `app/img/cases/moment dostavki/`; логотип `app/img/companies/moment.svg`
- Detailed single-case needed: да
- First-release readiness: готов к подробному кейсу без количественных результатов
- User questions: какие интеграции и платёжные детали можно раскрывать публично и какие метрики работы сервиса подтверждены

### 7. MS-Truck

- Production URL: `https://limitlesscreators.ru/cases/ms-truck/`
- Slug: `ms-truck`
- Public title: `MS-Truck`
- Material type: подробный кейс разработки
- Publication status: `confirmed`
- Archive filter category: `Корпоративные сайты`
- Confirmed year: 2025
- Actual Marat role: аналитика, структура, прототип, дизайн, собственная WordPress-тема, управляемый модельный ряд, формы по направлениям бизнеса, интеграция с Bitrix24, аналитика, SEO-подготовка и запуск
- Confirmed work: корпоративный сайт завода грузовых автомобилей с модельным рядом, карточками техники, сервисом, гарантией, запчастями, лизингом, дилерской сетью, новостями, разными формами обращения и CRM-интеграцией
- Confirmed tech: WordPress, custom theme, Bitrix24 forms/CRM integration, analytics
- Claims not to make: не использовать неподтверждённые проценты, трафик, визиты, просмотры, поисковые переходы, конверсию, PageSpeed и финансовые результаты
- Allowed numeric indicators: год 2025; измеримых результатов нет
- Unconfirmed metrics: 59%, 7%, визиты, посетители, просмотры, поисковый трафик, глубина просмотра, конверсия и любые показатели Яндекс Метрики
- Available materials: production URL; локальные изображения `app/img/cases/ms-truck/`; логотип `app/img/companies/ms-truck.svg`
- Detailed single-case needed: да
- First-release readiness: готов к подробному кейсу без неподтверждённых метрик
- User questions: можно ли использовать 59% и 7%, что они означают, и какие данные Яндекс Метрики подтверждены

### 8. Open Logistics

- Production URL: `https://limitlesscreators.ru/cases/open-logistics/`
- Slug: `open-logistics`
- Public title: `Open Logistics`
- Material type: подробный кейс разработки
- Publication status: `confirmed`
- Archive filter category: `Корпоративные сайты`
- Confirmed year: 2024
- Actual Marat role: структура, прототипы, дизайн с доработками по комментариям клиента, адаптивная вёрстка, WordPress, ACF, отдельные типы записей, RU/EN-версии, формы, CBR API, SEO-подготовка и запуск
- Confirmed work: многоязычный корпоративный сайт международной логистической компании с услугами, полезными материалами, подразделениями в разных странах, формами запроса расчёта и автоматическим получением курсов валют через API Банка России
- Confirmed tech: WordPress, custom theme, ACF, Polylang, CBR exchange rate API, forms
- Claims not to make: не утверждать неподтверждённые результаты, трафик, заявки, конверсию, скорость, SEO-рост или финансовый эффект
- Allowed numeric indicators: год 2024; измеримых результатов нет
- Unconfirmed metrics: трафик, заявки, конверсия, скорость, валютные операции и финансовые показатели
- Available materials: production URL; legacy redirect `/cases/open-log/`; локальные изображения `app/img/cases/open-log/`; логотип `app/img/companies/open-log.png`
- Detailed single-case needed: да
- First-release readiness: готов к подробному кейсу
- User questions: можно ли раскрывать детали интеграции API Банка России и результаты после запуска

### 9. Optitechno

- Production URL: `https://limitlesscreators.ru/cases/optitechno/`
- Slug: `optitechno`
- Public title: `Optitechno`
- Material type: подробный кейс каталога
- Publication status: `confirmed`
- Archive filter category: `Каталоги и интернет-магазины`
- Confirmed year: 2025
- Actual Marat role: вёрстка по предоставленному дизайну, собственная тема WordPress, ACF, WooCommerce, Polylang, импорт товаров из Excel, AJAX-поиск, формы, SEO-подготовка и поддержка после запуска
- Confirmed work: многоязычный B2B-каталог без онлайн-оплаты для международного рынка, с управлением товарами, импортом из Excel, поиском, формами запросов и поддержкой
- Confirmed tech: WordPress, WooCommerce, ACF, Polylang, Excel import, AJAX search, forms
- Claims not to make: не переносить рост органического трафика, снижение отказов, PageSpeed-метрики, точное количество товаров, WPML и результаты нагрузочного тестирования
- Allowed numeric indicators: год 2025; измеримых результатов нет
- Unconfirmed metrics: organic traffic growth, bounce rate reduction, PageSpeed metrics, exact product count, load testing results
- Available materials: production URL; локальные изображения `app/img/cases/optitechno/`; логотип `app/img/companies/optitechno.svg`
- Detailed single-case needed: да
- First-release readiness: готов к подробному кейсу без неподтверждённых метрик
- User questions: можно ли подтверждать количество товаров, результаты поддержки и показатели каталога

### 10. Markitties

- Production URL: `https://limitlesscreators.ru/cases/promo-sajt-na-wordpress/`
- Slug: `promo-sajt-na-wordpress`
- Public title: `Markitties`
- Material type: подробный кейс промо-сайта
- Publication status: `confirmed`
- Archive filter category: `Другие работы`
- Confirmed year: 2025
- Actual Marat role: адаптивная вёрстка по готовому дизайну клиента, собственная тема WordPress, ACF, управляемые услуги, раздел команды клиента и портфолио, RU/EN-версии, формы, бриф, SEO-подготовка, домены, SSL и поддержка
- Confirmed work: мультиязычный промо-сайт digital-проекта на WordPress, в котором контент основных разделов управляется через ACF, раздел команды клиента и портфолио работают внутри промо-страницы, а обращения и бриф отправляются через Contact Form 7
- Confirmed tech: WordPress, custom theme, ACF, Contact Form 7, RU/EN on separate domains, Open Graph, robots.txt, sitemap.xml, analytics
- Claims not to make: не утверждать, что Марат создавал исходный дизайн или переводы, если в тексте указано, что макеты и переводы предоставлял клиент
- Allowed numeric indicators: год 2025; измеримых результатов нет
- Unconfirmed metrics: трафик, заявки, конверсия, скорость, SEO-рост и финансовые показатели
- Available materials: production URL; локальные изображения `app/img/cases/markitties/`; логотипы `app/img/companies/markitties.svg` и `app/img/projects/markitties.svg`
- Detailed single-case needed: да
- First-release readiness: готов к подробному кейсу с акцентом на WordPress-интеграцию
- User questions: можно ли раскрывать домены, поддержку и измеримые результаты после запуска

### 11. Quartzprom

- Production URL: `https://limitlesscreators.ru/cases/quartzprom/`
- Slug: `quartzprom`
- Public title: `Quartzprom`
- Material type: подробный кейс каталога
- Publication status: `confirmed`
- Archive filter category: `Каталоги и интернет-магазины`
- Confirmed year: 2025
- Actual Marat role: структура, дизайн, вёрстка, WordPress, каталог, импорт, поиск, формы, SEO-подготовка и поддержка
- Confirmed work: корпоративный сайт-каталог для изделий из кварцевого стекла, оптики и технической керамики с WooCommerce, ACF, Contact Form 7, собственным импортом из Excel, AJAX-поиском с автодополнением и годовой поддержкой после запуска
- Confirmed tech: WordPress, WooCommerce, ACF, Contact Form 7, Excel import, AJAX search
- Claims not to make: не утверждать неподтверждённые продажи, трафик, заявки, конверсию, скорость, SEO-рост и финансовые результаты
- Allowed numeric indicators: год 2025; измеримых результатов нет
- Unconfirmed metrics: количество товаров, трафик, заявки, конверсия, скорость и продажи
- Available materials: production URL; локальные изображения `app/img/cases/quartzprom/`; логотипы `app/img/companies/quartzprom.svg` и `app/img/projects/quartzprom.svg`
- Detailed single-case needed: да
- First-release readiness: готов к подробному кейсу без количественных результатов
- User questions: можно ли раскрывать объём каталога, поддержку и показатели после запуска

### 12. RailTorg

- Production URL: `https://limitlesscreators.ru/cases/railtorg/`
- Slug: `railtorg`
- Public title: `RailTorg`
- Material type: подробный кейс B2B-платформы
- Publication status: `confirmed`
- Archive filter category: `Сервисы и платформы`
- Confirmed year: с 2024
- Actual Marat role: проектирование, дизайн и разработка B2B-платформы с публичным каталогом, личными кабинетами, заказами, документами, сообщениями, ролевой моделью и административными инструментами
- Confirmed work: действующая B2B-платформа для железнодорожной отрасли, объединяющая покупателей, поставщиков, каталог товаров и услуг, оформление заказов, документооборот, сообщения, импорт ассортимента и управление складами
- Confirmed tech: Vue SSR/SSG, Express, MongoDB, Docker, Caddy, Excel import, role-based accounts
- Claims not to make: не использовать неподтверждённые коммерческие результаты, выручку, количество пользователей, сделки, нагрузку, SEO, рекламу и публичные метрики
- Allowed numeric indicators: год начала работ 2024; измеримых результатов нет
- Unconfirmed metrics: пользователи, сделки, выручка, скорость, нагрузка, конверсия и любые бизнес-показатели
- Available materials: production URL; локальные изображения `app/img/cases/railtorg/`
- Detailed single-case needed: да
- First-release readiness: готов к подробному кейсу без раскрытия неподтверждённых бизнес-метрик
- User questions: какие детали backend, DevOps и коммерческой логики можно раскрывать публично

### 13. Reklama Fox

- Production URL: `https://limitlesscreators.ru/cases/reklama-fox/`
- Slug: `reklama-fox`
- Public title: `Reklama Fox`
- Material type: подробный кейс редизайна и разработки
- Publication status: `confirmed`
- Archive filter category: `Корпоративные сайты`
- Confirmed year: 2025
- Actual Marat role: структура, прототип, дизайн, тексты, адаптивная вёрстка, кастомная тема WordPress, ACF, формы, базовая SEO-подготовка и дальнейшая поддержка
- Confirmed work: редизайн и разработка одностраничного сайта мастерской рекламы с обновлённой подачей услуг, формами обращения, WordPress-управлением и трафиком через Яндекс Бизнес
- Confirmed tech: WordPress, custom theme, ACF, forms, Yandex Business
- Claims not to make: не утверждать неподтверждённые результаты, Яндекс Директ, SEO-рост, трафик, заявки, конверсию и финансовый эффект
- Allowed numeric indicators: год 2025; измеримых результатов нет
- Unconfirmed metrics: трафик, заявки, конверсия, стоимость лида, скорость и позиции
- Available materials: production URL; локальные изображения `app/img/cases/reklama-fox/`; логотип `app/img/companies/fox.png`
- Detailed single-case needed: да
- First-release readiness: готов к подробному кейсу без рекламных метрик
- User questions: какие результаты Яндекс Бизнес можно подтверждать

### 14. ABM / ABM-RT

- Production URL: `https://limitlesscreators.ru/cases/sajt-dlya-otraslevoj-associacii/`
- Slug: `sajt-dlya-otraslevoj-associacii`
- Public title: `ABM / ABM-RT`
- Material type: подробный кейс разработки
- Publication status: `confirmed`
- Archive filter category: `Корпоративные сайты`
- Confirmed year: 2021
- Actual Marat role: структура, прототип, дизайн, тексты, frontend, кастомная WordPress-тема, ACF, наполнение, формы, SEO-подготовка, deploy, домен и SSL
- Confirmed work: многостраничный корпоративный сайт отраслевой ассоциации с услугами, реестром участников, специалистами, новостями, отзывами, документами, галереей, партнёрами, формами и управлением через административную панель
- Confirmed tech: WordPress, custom theme, ACF, Contact Form 7, SSL, SEO metadata
- Claims not to make: не утверждать неподтверждённые SEO/рекламные результаты, рост заявок, трафик, финансовый эффект и состав команды
- Allowed numeric indicators: год 2021; измеримых результатов нет
- Unconfirmed metrics: заявки, позиции, трафик, конверсия, скорость и финансовые показатели
- Available materials: production URL; локальные изображения `app/img/cases/abm-rt/`; логотипы `app/img/companies/abm.svg` и `app/img/projects/abm.svg`
- Detailed single-case needed: да
- First-release readiness: готов к первому релизу после редакции формулировок
- User questions: можно ли раскрывать сроки, объём наполнения и текущий статус сайта

### 15. Aggregator

- Production URL: `https://limitlesscreators.ru/cases/sajt-produkta-na-wordpress/`
- Slug: `sajt-produkta-na-wordpress`
- Public title: `Aggregator`
- Material type: подробный кейс промо-сайта продукта
- Publication status: `confirmed`
- Archive filter category: `Другие работы`
- Confirmed year: 2023
- Actual Marat role: адаптивная вёрстка по предоставленному дизайну, собственная тема WordPress, ACF, блог, динамические разделы, интерактивные элементы, Contact Form 7, hosting/deploy и SEO-подготовка
- Confirmed work: промо-сайт цифрового продукта с главной страницей, редактируемыми блоками, тарифами, примерами, FAQ, блогом, архивом публикаций, шаблоном статьи, формами и публикацией на хостинге
- Confirmed tech: WordPress, custom theme, ACF, custom post types, Contact Form 7, JavaScript interactions
- Claims not to make: не утверждать, что Марат создавал исходный дизайн; не использовать неподтверждённые продажи, трафик, конверсию, заявки и финансовые результаты
- Allowed numeric indicators: год 2023; измеримых результатов нет
- Unconfirmed metrics: показатели продукта, заявки, трафик, конверсия, скорость и доход
- Available materials: production URL; локальные изображения `app/img/cases/aggregator/`
- Detailed single-case needed: да
- First-release readiness: готов к подробному кейсу с нейтральным названием и без метрик
- User questions: какое публичное название продукта допустимо раскрывать и можно ли использовать бренд вместо условного `Aggregator`

### 16. Sarakula Interiors

- Production URL: `https://limitlesscreators.ru/cases/sarakula-interiors/`
- Slug: `sarakula-interiors`
- Public title: `Sarakula Interiors`
- Material type: подробный кейс разработки
- Publication status: `confirmed`
- Archive filter category: `Корпоративные сайты`
- Confirmed year: 2023
- Actual Marat role: дизайн, вёрстка, WordPress, ACF, мультиязычность, анимации, формы, SEO-подготовка и поддержка
- Confirmed work: сайт-портфолио студии дизайна интерьеров с каталогом проектов, отдельными страницами жилых и общественных пространств, RU/EN-версиями, управлением проектами через WordPress и формами связи
- Confirmed tech: WordPress, ACF, Polylang, animations, forms
- Claims not to make: не утверждать неподтверждённые продажи, заявки, трафик, конверсию, SEO-рост и финансовые результаты
- Allowed numeric indicators: год 2023; измеримых результатов нет
- Unconfirmed metrics: трафик, заявки, конверсия, скорость и продажи
- Available materials: production URL; локальные изображения `app/img/cases/sarakula-interiors/`
- Detailed single-case needed: да
- First-release readiness: готов к подробному кейсу
- User questions: можно ли раскрывать результаты сопровождения и показатели после запуска

### 17. TopStore

- Production URL: `https://limitlesscreators.ru/cases/topstore/`
- Slug: `topstore`
- Public title: `TopStore`
- Material type: подробный frontend-кейс
- Publication status: `confirmed`
- Archive filter category: `Другие работы`
- Confirmed year: 2023
- Actual Marat role: адаптивная frontend-вёрстка, реализация всех блоков, интерактивные элементы, SMTP-форма, оптимизация ресурсов, метатеги, аналитика и запуск опубликованной версии
- Confirmed work: одностраничный промосайт сервиса для продавцов на маркетплейсах, созданный по предоставленным заказчиком структуре, дизайну и текстам
- Confirmed tech: HTML, CSS, JavaScript, SMTP form, meta tags, analytics
- Claims not to make: не утверждать дизайн, тексты, WordPress/CMS, полный цикл, SEO-рост, рекламу и бизнес-результаты
- Allowed numeric indicators: год 2023; измеримых результатов нет
- Unconfirmed metrics: трафик, заявки, конверсия, скорость и продажи
- Available materials: production URL; локальные изображения `app/img/cases/topstore/`; логотипы `app/img/companies/topstore.svg` и `app/img/projects/topstore.svg`
- Detailed single-case needed: да
- First-release readiness: готов к первому релизу после редакции текста без full-cycle claims
- User questions: можно ли раскрывать сроки, стек сборки и конкретные оптимизационные результаты

### 18. White Ceramic

- Production URL: `https://limitlesscreators.ru/cases/white-ceramic/`
- Slug: `white-ceramic`
- Public title: `White Ceramic`
- Material type: подробный кейс каталога
- Publication status: `confirmed`
- Archive filter category: `Каталоги и интернет-магазины`
- Confirmed year: 2024
- Actual Marat role: анализ, структура, прототип, дизайн, тексты, frontend, WordPress, формы, SEO-подготовка, изображения и deploy
- Confirmed work: адаптивный сайт-каталог салона плитки и сантехники с направлениями продукции, PDF-каталогами производителей, услугами, проектами, контактами, формой обращения и управлением через WordPress
- Confirmed tech: WordPress, custom theme, forms, Schema.org, Open Graph, robots.txt, sitemap.xml, image optimization
- Claims not to make: не использовать `White Ceramic` в title, description и H1; не утверждать неподтверждённые бизнес-результаты, SEO-рост, рекламу и состав команды
- Allowed numeric indicators: год 2024; измеримых результатов нет
- Unconfirmed metrics: заявки, позиции, трафик, конверсия, скорость, продажи и финансовые показатели
- Available materials: production URL; локальные изображения `app/img/cases/white ceramic/`; логотип `app/img/companies/whiteceramic.png`
- Detailed single-case needed: да
- First-release readiness: готов к первому релизу с обязательным ограничением по title/description/H1
- User questions: какой публичный заголовок использовать вместо `White Ceramic` в SEO-полях и H1, и можно ли подтвердить результаты
