# 规范

## 适用范围

- 本文档定义开发规范，配合 `.docs/architecture.md`、`.docs/database.md`、`.docs/tools.md` 使用。
- 不做现有目录重构；仅约束新增代码的组织方式。

## 目录与模块

- 根目录沿用 layer-first：`app/`、`components/`、`hooks/`、`lib/`、`db/`。
- 新增业务模块按 feature-first 放在 `features/<name>/`，模块内自洽。
- 跨模块依赖只允许通过对外导出，避免深层路径互相引用。
- `features/<name>/schemas.ts` 只放 Zod 输入/输出校验，不放数据库表定义。
- `db/schema/*.ts` 只放 Drizzle 表定义，迁移以此为准。

示例结构：

```
features/todo/
  index.ts
  actions.ts
  components/
  schemas.ts
  types.ts
```

## 命名约定

- 文件名默认 kebab-case。
- Next 路由文件按约定命名：`page.tsx`、`layout.tsx`、`loading.tsx`、`error.tsx`。
- 组件导出使用 PascalCase，hooks 使用 `useXxx`。
- 数据库表与字段使用 snake_case。

## 边界与职责

- 默认使用 RSC，只有需要交互/状态的组件才加 `use client`。
- 读走 RSC，写走 server actions，不在客户端直接访问数据库。
- 外部 HTTP 调用使用 ky（通过 `lib/http.ts` 的 `http` 实例），放在 server action 或服务端模块。

## Server action 返回封装

- server action 统一用 `lib/action.ts` 的 `withAction` 返回 `ActionResult`。
- 业务错误使用 `lib/errors.ts` 的错误类型，避免返回裸异常。
- 客户端用 `lib/action-client.ts` 处理 `unauthorized`，统一弹窗或 toast。

```ts
'use server';

import { withAction } from '@/lib/action';
import { requireSessionUser } from '@/features/auth';

export async function createSomething(input: unknown) {
  return withAction(async () => {
    const user = await requireSessionUser('Please sign in to continue.');
    // ...业务逻辑
    return { userId: user.id };
  });
}
```

```ts
'use client';

import { handleUnauthorizedResult } from '@/lib/action-client';

const result = await createSomething(input);
handleUnauthorizedResult(result);
```

## 外部 HTTP 配置

- 统一复用 `lib/http.ts` 里的默认配置。

```ts
import { http } from '@/lib/http';

export async function fetchItems() {
  return http.get('https://api.example.com/items').json();
}
```

## 数据校验

- 边界输入必须用 Zod 校验（API 入参、表单提交、server action）。
- 类型用 `z.infer` 生成，避免重复定义。

```ts
import { z } from 'zod';

const schema = z.object({ title: z.string().min(1) });
type Input = z.infer<typeof schema>;
```

## 错误处理

- 业务边界统一使用 `lib/errors.ts` 的基础错误类型。
- 未识别的异常统一转为 `InternalError`。

```ts
import { InternalError, isAppError } from '@/lib/errors';

export function normalizeError(error: unknown) {
  return isAppError(error) ? error : new InternalError('Unexpected error', error);
}
```

## 客户端状态

- 客户端状态统一用 Zustand。
- store 放在对应 `features/<name>/` 内，避免全局污染。

```ts
'use client';

import { create } from 'zustand';

type UiState = { sidebarOpen: boolean; toggle: () => void };

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  toggle: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
```
