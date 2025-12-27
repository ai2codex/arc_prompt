import type { ActionResult } from '@/lib/action';

export type TagItem = {
  id: string;
  name: string;
};

export type PromptListItem = {
  id: string;
  title: string | null;
  content: string;
  tags: TagItem[];
  createdAt: string;
  updatedAt: string;
  userId: string;
  userName: string;
};

export type PromptListData = {
  items: PromptListItem[];
  hasMore: boolean;
  nextOffset: number | null;
};

export type TagListData = {
  items: TagItem[];
};

export type PromptListResult = ActionResult<PromptListData>;
export type TagListResult = ActionResult<TagListData>;
