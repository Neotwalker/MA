# Запуск проекта в Codex

1. Открыть frontend reference repository:
   `C:\Users\and1m\Desktop\work\limitless-codex`
2. Прочитать `AGENTS.md`.
3. Прочитать `CODEX_TASK.md`.
4. Проверить Git state:

```bash
git status --short
git branch --show-current
git log -1 --oneline
```

5. Понять, что затрагивает задача: frontend reference repo, existing WordPress installation или оба проекта.
6. Не изменять файлы, пока scope задачи и working tree не понятны.
7. Existing WordPress target:
   `D:\OpenServer\domains\limitlesscreators`
8. Для WordPress-задач сначала inspect/audit existing WP project. Не предполагать clean new WordPress install.
9. QA по умолчанию code-level. Не запускать Browser QA, Playwright, screenshots или dev server автоматически.
10. Не начинать самостоятельно Wordstat, semantics, clustering или keyword mapping; внедрять только утвержденный content/SEO output.

`origin/main` защищен: не изменять и не push без отдельной явной команды пользователя. Рабочая frontend ветка: `redesign-2026`.
