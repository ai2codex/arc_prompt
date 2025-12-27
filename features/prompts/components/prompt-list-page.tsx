import { listPrompts } from '@/features/prompts/actions';
import { PromptListClient } from '@/features/prompts/components/prompt-list-client';

export default async function PromptListPage() {
  const initialData = await listPrompts({ offset: 0, limit: 50 });
  return <PromptListClient initialData={initialData} />;
}
