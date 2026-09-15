# Запуск проекта в Codex

1. Открыть frontend reference repository:
   `C:\Users\and1m\Desktop\work\MA-project\limitless-codex`
2. Прочитать authoritative project instructions:
   `C:\Users\and1m\Desktop\work\MA-project\limitless-wp\wp-content\AGENTS.md`
3. Прочитать canonical repo notes в `AGENTS.md`.
4. Прочитать `CODEX_TASK.md`.
5. Проверить Git state:

```bash
git status --short
git branch --show-current
git log -1 --oneline
```

6. Понять, что затрагивает задача: frontend reference repo, WordPress source repo, OpenServer runtime или несколько областей.
7. Не изменять файлы, пока scope задачи и working tree не понятны.
8. OpenServer runtime:
   `D:\OpenServer\domains\limitlesscreators`
9. Project-wide Git, QA, runtime sync and WordPress workflow rules are owned by the authoritative tracked WordPress `AGENTS.md`.

Рабочая frontend ветка: `redesign-2026`.
