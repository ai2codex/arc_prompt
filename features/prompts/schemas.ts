import { z } from 'zod';

export const promptCreateSchema = z.object({
  title: z.string().trim().optional(),
  content: z.string().trim().min(1, 'Content is required'),
  tags: z.array(z.string()).optional(),
});

export const promptUpdateSchema = promptCreateSchema.extend({
  id: z.uuid(),
});

export const promptListSchema = z.object({
  query: z.string().trim().optional(),
  tagNames: z.array(z.string()).optional(),
  offset: z.number().int().min(0).default(0),
  limit: z.number().int().min(1).max(200).default(50),
});

export const tagListSchema = z.object({
  query: z.string().trim().optional(),
  limit: z.number().int().min(1).max(200).default(50),
});
