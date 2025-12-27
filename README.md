# Next.js 一键登录模板

基于 Next.js App Router 的工程模板，默认使用 RSC + server actions，内置 Google One Tap 登录（better-auth）、Drizzle ORM、shadcn/ui 组件与 Tailwind CSS。

## 环境要求

- Node.js >= 22
- pnpm（仓库指定 `pnpm@10.23.0`）

## 快速开始

```bash
# 安装依赖
pnpm install
# 生成环境变量
pnpm gen:env
```

编辑 `.env`，至少补齐以下变量：

- `DATABASE_URI`
- `BETTER_AUTH_SECRET`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

启动开发服务器：

```bash
pnpm dev
```

访问 `http://localhost:3000`，默认页面会触发 One Tap 登录组件。

## 目录结构（高层）

- `app/`：路由与 RSC 页面/布局
- `app/api/auth/[...all]/route.ts`：better-auth 统一入口
- `features/`：业务模块，默认含 `features/auth/`
- `components/ui/`：shadcn/ui 组件
- `lib/`：通用能力（`db`/`env`/`auth`/`http`/`errors`）
- `db/`：Drizzle schema 与迁移

## 关键约定

- 默认 RSC；只有需要交互/状态的组件才加 `use client`
- 写操作只走 server actions
- 外部 HTTP 调用统一用 `lib/http.ts` 的 `http`
- 边界输入用 Zod 校验，客户端状态用 Zustand
- server action 统一用 `lib/action.ts` 返回 `ActionResult`
- 表和字段统一 snake_case

## 认证（Google One Tap）

- 入口路由：`app/api/auth/[...all]/route.ts`
- 服务端配置：`lib/auth.ts`
- 客户端唤起：`features/auth/client.ts`
- 服务端会话：`features/auth/server.ts`
- 默认入口 UI：`features/auth/components/one-tap-gate.tsx`
- 未登录弹窗：`features/auth/components/auth-required-modal.tsx`

在客户端组件中手动唤起：

```ts
import { startOneTap } from '@/features/auth/client';

await startOneTap();
```

## 数据库与迁移

1. 在 `db/schema/*.ts` 修改表结构（snake_case）
2. 生成迁移：`pnpm db:generate`
3. 检查 `db/migrations/` SQL
4. 执行迁移：`pnpm db:migrate`
5. 可视化：`pnpm db:studio`

认证表由 `db/schema/auth.ts` 定义，可用 `pnpm db:generate:auth` 重新生成。

## 环境变量

必填：

- `DATABASE_URI`：Postgres 连接串
- `BETTER_AUTH_SECRET`：better-auth 签名密钥
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`：Google Client ID
- `NEXT_PUBLIC_GOOGLE_CLIENT_SECRET`：Google Client Secret

可选：

- `BETTER_AUTH_URL`：站点基准 URL（生产建议配置）
- `BETTER_AUTH_COOKIE_DOMAIN`：跨子域 Cookie 域名
- `BETTER_AUTH_COOKIE_PREFIX`：Cookie 前缀（默认 `better-auth`）

说明：

- `.env.example` 里包含 `GOOGLE_API_KEY`，当前代码未引用。

## 脚本说明

- `pnpm dev`：本地开发
- `pnpm build`：生产构建
- `pnpm start`：运行生产构建
- `pnpm lint`：ESLint 检查
- `pnpm fmt`：Prettier 格式化
- `pnpm gen:env`：从 `.env.example` 生成 `.env`
- `pnpm db:generate`：根据 Drizzle schema 生成迁移
- `pnpm db:migrate`：执行数据库迁移
- `pnpm db:studio`：打开 Drizzle Studio
- `pnpm db:generate:auth`：生成 better-auth 认证表定义

## 文档索引

- `./.docs/README.md`（总览）
- `./.docs/architecture.md`
- `./.docs/standards.md`
- `./.docs/database.md`
- `./.docs/auth.md`
- `./.docs/tools.md`
