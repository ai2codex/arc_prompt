'use server';

import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { z } from 'zod';

import { prompt_tags, prompts, tags } from '@/db/schema/prompts';
import { requireSessionUser } from '@/features/auth';
import type { ActionResult } from '@/lib/action';
import { withAction } from '@/lib/action';
import { db } from '@/lib/db';
import { InternalError, NotFoundError, ValidationError } from '@/lib/errors';

import {
  promptCreateSchema,
  promptListSchema,
  promptUpdateSchema,
  tagListSchema,
} from '@/features/prompts/schemas';
import type {
  PromptListItem,
  PromptListResult,
  TagItem,
  TagListResult,
} from '@/features/prompts/types';

const DEFAULT_LIMIT = 50;

function normalizeTagNames(names?: string[]) {
  if (!names?.length) {
    return [];
  }
  const normalized = new Set<string>();
  for (const name of names) {
    const value = name.trim().toLowerCase();
    if (value) {
      normalized.add(value);
    }
  }
  return Array.from(normalized);
}

async function ensureTags(userId: string, names: string[]): Promise<TagItem[]> {
  if (names.length === 0) {
    return [];
  }
  const existing = await db
    .select({ id: tags.id, name: tags.name, is_deleted: tags.is_deleted })
    .from(tags)
    .where(and(eq(tags.user_id, userId), inArray(tags.name, names)));

  const restoreIds = existing.filter((tag) => tag.is_deleted).map((tag) => tag.id);
  if (restoreIds.length > 0) {
    await db
      .update(tags)
      .set({ is_deleted: false, updated_at: new Date() })
      .where(inArray(tags.id, restoreIds));
  }

  const existingNames = new Set(existing.map((tag) => tag.name));
  const missing = names.filter((name) => !existingNames.has(name));

  if (missing.length > 0) {
    await db.insert(tags).values(
      missing.map((name) => ({
        name,
        user_id: userId,
      })),
    );
  }

  return db
    .select({ id: tags.id, name: tags.name })
    .from(tags)
    .where(and(eq(tags.user_id, userId), inArray(tags.name, names), eq(tags.is_deleted, false)));
}

export async function listTags(input?: unknown): Promise<TagListResult> {
  return withAction(async () => {
    const user = await requireSessionUser('Please sign in to view tags.');
    const parsedResult = tagListSchema.safeParse(input ?? {});
    if (!parsedResult.success) {
      throw new ValidationError('Invalid tag query.', parsedResult.error);
    }
    const parsed = parsedResult.data;

    const conditions = [eq(tags.user_id, user.id), eq(tags.is_deleted, false)];
    const tagQuery = parsed.query?.trim().toLowerCase();
    if (tagQuery) {
      const pattern = `%${tagQuery}%`;
      conditions.push(sql`${tags.name} ilike ${pattern}`);
    }

    const rows = await db
      .select({ id: tags.id, name: tags.name })
      .from(tags)
      .where(and(...conditions))
      .orderBy(desc(tags.updated_at))
      .limit(parsed.limit);

    return {
      items: rows,
    };
  });
}

export async function listPrompts(input?: unknown): Promise<PromptListResult> {
  return withAction(async () => {
    const user = await requireSessionUser('Please sign in to view prompts.');
    const parsedResult = promptListSchema.safeParse(input ?? {});
    if (!parsedResult.success) {
      throw new ValidationError('Invalid prompt query.', parsedResult.error);
    }
    const parsed = parsedResult.data;

    const normalizedTagNames = normalizeTagNames(parsed.tagNames);
    let tagIds: string[] = [];

    if (normalizedTagNames.length > 0) {
      const tagRows = await db
        .select({ id: tags.id, name: tags.name, is_deleted: tags.is_deleted })
        .from(tags)
        .where(and(eq(tags.user_id, user.id), inArray(tags.name, normalizedTagNames)));
      tagIds = tagRows.filter((tag) => !tag.is_deleted).map((tag) => tag.id);
      if (tagIds.length === 0) {
        return {
          items: [],
          hasMore: false,
          nextOffset: null,
        };
      }
    }

    const conditions = [eq(prompts.user_id, user.id), eq(prompts.is_deleted, false)];
    const promptQuery = parsed.query?.trim();
    if (promptQuery) {
      const pattern = `%${promptQuery}%`;
      conditions.push(
        sql`(coalesce(${prompts.title}, '') ilike ${pattern} or ${prompts.content} ilike ${pattern})`,
      );
    }
    if (tagIds.length > 0) {
      conditions.push(
        sql`exists (select 1 from ${prompt_tags} where ${prompt_tags.prompt_id} = ${prompts.id} and ${inArray(
          prompt_tags.tag_id,
          tagIds,
        )})`,
      );
    }

    const limit = parsed.limit ?? DEFAULT_LIMIT;
    const rows = await db
      .select({
        id: prompts.id,
        title: prompts.title,
        content: prompts.content,
        createdAt: prompts.created_at,
        updatedAt: prompts.updated_at,
      })
      .from(prompts)
      .where(and(...conditions))
      .orderBy(desc(prompts.updated_at))
      .offset(parsed.offset)
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const pageRows = hasMore ? rows.slice(0, limit) : rows;
    const promptIds = pageRows.map((row) => row.id);
    const tagMap = new Map<string, TagItem[]>();

    if (promptIds.length > 0) {
      const tagRows = await db
        .select({
          promptId: prompt_tags.prompt_id,
          id: tags.id,
          name: tags.name,
        })
        .from(prompt_tags)
        .innerJoin(tags, eq(prompt_tags.tag_id, tags.id))
        .where(
          and(
            inArray(prompt_tags.prompt_id, promptIds),
            eq(tags.user_id, user.id),
            eq(tags.is_deleted, false),
          ),
        );

      for (const row of tagRows) {
        const current = tagMap.get(row.promptId) ?? [];
        current.push({ id: row.id, name: row.name });
        tagMap.set(row.promptId, current);
      }
    }

    const items: PromptListItem[] = pageRows.map((row) => ({
      id: row.id,
      title: row.title ?? null,
      content: row.content,
      tags: tagMap.get(row.id) ?? [],
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      userId: user.id,
      userName: user.name,
    }));

    return {
      items,
      hasMore,
      nextOffset: hasMore ? parsed.offset + limit : null,
    };
  });
}

export async function createPrompt(input: unknown): Promise<ActionResult<{ id: string }>> {
  return withAction(async () => {
    const user = await requireSessionUser('Please sign in to create prompts.');
    const parsedResult = promptCreateSchema.safeParse(input);
    if (!parsedResult.success) {
      throw new ValidationError('Invalid prompt data.', parsedResult.error);
    }
    const parsed = parsedResult.data;
    const title = parsed.title?.trim() || null;
    const content = parsed.content.trim();
    const tagNames = normalizeTagNames(parsed.tags);

    const inserted = await db
      .insert(prompts)
      .values({
        title,
        content,
        user_id: user.id,
      })
      .returning({ id: prompts.id });

    const promptId = inserted[0]?.id;
    if (!promptId) {
      throw new InternalError('Create failed. Please try again.');
    }

    if (tagNames.length > 0) {
      const tagRows = await ensureTags(user.id, tagNames);
      if (tagRows.length > 0) {
        await db.insert(prompt_tags).values(
          tagRows.map((tag) => ({
            prompt_id: promptId,
            tag_id: tag.id,
          })),
        );
      }
    }

    return { id: promptId };
  });
}

export async function updatePrompt(input: unknown): Promise<ActionResult> {
  return withAction(async () => {
    const user = await requireSessionUser('Please sign in to update prompts.');
    const parsedResult = promptUpdateSchema.safeParse(input);
    if (!parsedResult.success) {
      throw new ValidationError('Invalid prompt data.', parsedResult.error);
    }
    const parsed = parsedResult.data;
    const title = parsed.title?.trim() || null;
    const content = parsed.content.trim();
    const tagNames = normalizeTagNames(parsed.tags);

    const updated = await db
      .update(prompts)
      .set({ title, content, updated_at: new Date() })
      .where(
        and(eq(prompts.id, parsed.id), eq(prompts.user_id, user.id), eq(prompts.is_deleted, false)),
      )
      .returning({ id: prompts.id });

    if (updated.length === 0) {
      throw new NotFoundError('Prompt not found.');
    }

    await db.delete(prompt_tags).where(eq(prompt_tags.prompt_id, parsed.id));

    if (tagNames.length > 0) {
      const tagRows = await ensureTags(user.id, tagNames);
      if (tagRows.length > 0) {
        await db.insert(prompt_tags).values(
          tagRows.map((tag) => ({
            prompt_id: parsed.id,
            tag_id: tag.id,
          })),
        );
      }
    }
  });
}

const promptDeleteSchema = z.string().uuid();

export async function deletePrompt(id: unknown): Promise<ActionResult> {
  return withAction(async () => {
    const user = await requireSessionUser('Please sign in to delete prompts.');
    const parsed = promptDeleteSchema.safeParse(id);
    if (!parsed.success) {
      throw new ValidationError('Invalid prompt id.', parsed.error);
    }
    const promptId = parsed.data;
    const updated = await db
      .update(prompts)
      .set({ is_deleted: true, updated_at: new Date() })
      .where(
        and(eq(prompts.id, promptId), eq(prompts.user_id, user.id), eq(prompts.is_deleted, false)),
      )
      .returning({ id: prompts.id });

    if (updated.length === 0) {
      throw new NotFoundError('Prompt not found.');
    }
  });
}
