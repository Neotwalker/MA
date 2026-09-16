# Запуск проекта в Codex

1. Открыть frontend reference repository:
   `C:\Users\and1m\Desktop\work\MA-project\limitless-codex`
2. Прочитать authoritative project instructions:
   `C:\Users\and1m\Desktop\work\MA-project\limitless-wp\wp-content\AGENTS.md`
3. Прочитать canonical repo notes в `AGENTS.md`.
4. Для текущего migration status / next task, когда это относится к задаче, читать:
   `C:\Users\and1m\Desktop\work\MA-project\limitless-wp\wp-content\docs\REBRAND-MIGRATION-ROADMAP.md`
5. `CODEX_TASK.md` использовать только как optional historical/canonical reference. Он не определяет текущую задачу или roadmap.
6. Проверить Git state:

```bash
git status --short
git branch --show-current
git log -1 --oneline
```

7. Понять, что затрагивает задача: frontend reference repo, WordPress source repo, OpenServer runtime или несколько областей.
8. Не изменять файлы, пока scope задачи и working tree не понятны.
9. OpenServer runtime:
   `D:\OpenServer\domains\limitlesscreators`
10. Project-wide Git, QA, runtime sync and WordPress workflow rules are owned by the authoritative tracked WordPress `AGENTS.md`.

Рабочая frontend ветка: `redesign-2026`.
