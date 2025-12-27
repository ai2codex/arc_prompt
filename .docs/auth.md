# 认证

## 目标

- 使用 better-auth + Google One Tap。
- 项目仅支持一键登录，不提供登录/注册表单。

## 入口与结构

- API 入口：`app/api/auth/[...all]/route.ts`
- 认证配置：`lib/auth.ts`
- 客户端封装：`features/auth/client.ts`
- 入口 UI：`features/auth/components/one-tap-gate.tsx`
- 未登录弹窗：`features/auth/components/auth-required-modal.tsx`

## 环境变量

- `BETTER_AUTH_SECRET`：服务端签名密钥（必填）。
- `BETTER_AUTH_URL`：站点基准 URL（建议生产环境必填）。
- `BETTER_AUTH_COOKIE_DOMAIN`：跨子域 Cookie 域名（可选，生产环境按需）。
- `BETTER_AUTH_COOKIE_PREFIX`：Cookie 前缀（可选，默认 `better-auth`）。
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`：Google Client ID（必填）。
- `NEXT_PUBLIC_GOOGLE_CLIENT_SECRET`：Google Client Secret（必填）。
- `DATABASE_URI`：数据库连接字符串（必填）。

## 客户端唤起

在任意客户端组件中调用：

```ts
import { startOneTap } from '@/features/auth/client';

await startOneTap();
```

默认入口组件 `features/auth/components/one-tap-gate.tsx` 会在页面加载时自动唤起，并提供重试按钮。

## 服务端会话

- `features/auth/server.ts` 提供 `getSessionUser` 与 `requireSessionUser`。
- `requireSessionUser` 用于 server action 鉴权，不通过则抛出 `UnauthorizedError`。

## 未登录提示

- `AuthRequiredModal` 默认挂载在根布局中。
- 客户端可通过 `features/auth/store.ts` 打开/关闭弹窗。

## 数据库表

认证表由 `db/schema/auth.ts` 定义，包含：

- `user`
- `session`
- `account`
- `verification`

字段使用 snake_case，并与 `lib/auth.ts` 的字段映射保持一致。

## Cookie 约定

- 生产环境使用 `secure` Cookie；开发环境不强制。
- 默认开启跨子域 Cookie（`crossSubDomainCookies.enabled = true`）。
- Cookie 属性集中配置在 `lib/auth.ts` 的 `advanced.defaultCookieAttributes`。
