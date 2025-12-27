# 数据库

## 目标

- Postgres + Drizzle ORM。
- 迁移由 `drizzle-kit` 统一管理。
- 连接字符串从 `DATABASE_URI` 读取。

## 文件布局

- `drizzle.config.ts`：迁移配置。
- `db/schema/*.ts`：表定义（snake_case），只放 Drizzle 表结构。
- `db/migrations/`：迁移文件输出目录。
- `lib/env.ts`：环境变量校验（Zod）。
- `lib/db.ts`：数据库连接与 Drizzle 实例。
- `db/schema/auth.ts`：better-auth 认证表（user/session/account/verification）。

## 迁移流程

1. 在 `db/schema/*.ts` 中新增/修改表与字段。
2. 生成迁移：`pnpm db:generate`。
3. 评审 `db/migrations/` 里的 SQL 变更。
4. 执行迁移：`pnpm db:migrate`。
5. 本地查看：`pnpm db:studio`。

## 约定

- 表名与字段名一律 snake_case。
- 生产环境只允许使用迁移，不使用 `db:push`。
- Zod 校验放在业务模块的 `features/<name>/schemas.ts`，不进 `db/schema`。
- 认证相关表字段名需与 `lib/auth.ts` 的字段映射保持一致。

## 示例：snake_case 表定义

```ts
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const todo_items = pgTable('todo_items', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});
```
