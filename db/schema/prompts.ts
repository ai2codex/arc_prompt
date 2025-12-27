import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

import { user } from '@/db/schema/auth';

export const prompts = pgTable(
  'prompts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title'),
    content: text('content').notNull(),
    user_id: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    is_deleted: boolean('is_deleted').default(false).notNull(),
  },
  (table) => [
    index('prompts_user_updated_idx').on(table.user_id, table.updated_at),
    index('prompts_user_deleted_idx').on(table.user_id, table.is_deleted),
  ],
);

export const tags = pgTable(
  'tags',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    user_id: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    is_deleted: boolean('is_deleted').default(false).notNull(),
  },
  (table) => [
    uniqueIndex('tags_user_name_unique').on(table.user_id, table.name),
    index('tags_user_updated_idx').on(table.user_id, table.updated_at),
  ],
);

export const prompt_tags = pgTable(
  'prompt_tags',
  {
    prompt_id: uuid('prompt_id')
      .notNull()
      .references(() => prompts.id, { onDelete: 'cascade' }),
    tag_id: uuid('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
    created_at: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.prompt_id, table.tag_id], name: 'prompt_tags_pk' }),
    index('prompt_tags_tag_id_idx').on(table.tag_id),
  ],
);

export const promptRelations = relations(prompts, ({ many, one }) => ({
  prompt_tags: many(prompt_tags),
  user: one(user, {
    fields: [prompts.user_id],
    references: [user.id],
  }),
}));

export const tagRelations = relations(tags, ({ many, one }) => ({
  prompt_tags: many(prompt_tags),
  user: one(user, {
    fields: [tags.user_id],
    references: [user.id],
  }),
}));

export const promptTagRelations = relations(prompt_tags, ({ one }) => ({
  prompt: one(prompts, {
    fields: [prompt_tags.prompt_id],
    references: [prompts.id],
  }),
  tag: one(tags, {
    fields: [prompt_tags.tag_id],
    references: [tags.id],
  }),
}));
