# 架构

## 原则

- 以 RSC 为默认渲染模型，减少客户端 JS。
- 只有需要交互/状态的组件才加 `use client`。
- 写操作只能通过 server actions。

## 数据路径

- 读：RSC -> 数据库（Drizzle）。
- 写：Client -> server action -> 数据库（Drizzle）。
- 外部 API：server action -> `http`（ky）。

## 目录职责（高层）

- `app/`：路由与 RSC 页面/布局。
- `components/`：可复用 UI 组件。
- `lib/`：服务端通用能力（`db`/`env` 等）。
- `db/`：数据库 schema 与迁移。
- `features/`：新增业务模块（feature-first，按 `features/<name>/`）。

## 技术栈（含 llms.txt）

- Next.js (RSC + server actions) [Read more](https://nextjs.org/docs/llms.txt)
- React
- TypeScript
- Zod [Read more](https://zod.dev/llms.txt)
- Zustand [Read more](https://raw.githubusercontent.com/pmndrs/zustand/refs/heads/main/docs/llms.txt)
- Drizzle ORM [Read more](https://orm.drizzle.team/llms.txt)
- Postgres [Read more with neon](https://neon.com/docs/concepts/postgres)
- ky [Read more](https://ky.dev/llms.txt)

## 示例：server action + Zod

```ts
// app/todos/actions.ts
'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

const inputSchema = z.object({
  title: z.string().min(1),
});

export async function createTodo(formData: FormData) {
  const input = inputSchema.parse(Object.fromEntries(formData));
  await db.execute(sql`insert into todo_items (title) values (${input.title})`);
}
```

## 示例：RSC 读取

```tsx
// app/todos/page.tsx
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export default async function Page() {
  const result = await db.execute(sql`select id, title from todo_items order by id desc`);
  return (
    <ul>
      {result.rows.map((row) => (
        <li key={row.id}>{row.title}</li>
      ))}
    </ul>
  );
}
```
