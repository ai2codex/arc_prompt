# 工程文档总览

本目录是 AI 编程与协作的唯一规范来源。文档保持扁平化，不新增子目录。

## 索引

- [架构](./architecture.md)
- [规范](./standards.md)
- [数据库](./database.md)
- [工具](./tools.md)

## 快速约定

- 默认使用 RSC，写操作走 server actions。
- 外部 HTTP 调用使用 `lib/http.ts` 的 `http` 实例。
- Postgres + Drizzle，连接读取 `DATABASE_URI`。
- 表和字段使用 snake_case。
- Zod 负责边界数据校验，Zustand 负责客户端状态。
