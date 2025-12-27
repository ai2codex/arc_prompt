# 工具

## ky（HTTP）

- 使用 `lib/http.ts` 导出的 `http` 实例。
- 用在外部 API 或跨服务调用；内部数据优先走 Drizzle。

```ts
import { http } from '@/lib/http';

type Item = { id: string; title: string };

export async function fetchItems() {
  return http
    .get('https://api.example.com/items', {
      searchParams: { limit: 20 },
    })
    .json<Item[]>();
}
```

```ts
import { http } from '@/lib/http';

export async function createItem(title: string) {
  await http.post('https://api.example.com/items', {
    json: { title },
  });
}
```

## Zod（边界校验）

```ts
import { z } from 'zod';

const schema = z.object({ title: z.string().min(1) });
type Input = z.infer<typeof schema>;

export function parseInput(data: unknown): Input {
  return schema.parse(data);
}
```

## Zustand（客户端状态）

```ts
'use client';

import { create } from 'zustand';

type UiState = {
  sidebarOpen: boolean;
  toggle: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  toggle: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
```
