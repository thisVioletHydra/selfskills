# apps/web

Фронт на React. Архитектура — Feature-Sliced Design (FSD).

## Слои (сверху вниз)

| Слой       | Зачем                                    |
| ---------- | ---------------------------------------- |
| `app`      | Провайдеры, роутер, точка входа          |
| `pages`    | Страницы по роутам                       |
| `widgets`  | Крупные блоки страницы                   |
| `features` | Действия пользователя (кнопки с логикой) |
| `entities` | Сущности домена                          |
| `shared`   | Общее: UI-кит, GraphQL-клиент, хелперы   |

Правило импортов: верхний слой может брать нижний. Наоборот — нельзя.

```
app → pages → widgets → features → entities → shared
```

GraphQL только через `shared/api`.

## Запуск (позже)

Dev: `pnpm --filter web dev`  
Prod: `pnpm --filter web build` + start  
В Docker не кладём.
