'use client';

import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { OneTapGate } from '@/features/auth/components/one-tap-gate';
import { listPrompts } from '@/features/prompts/actions';
import { PromptDrawer, type PromptDrawerMode } from '@/features/prompts/components/prompt-drawer';
import { TagPicker } from '@/features/prompts/components/tag-picker';
import type { PromptListItem, PromptListResult } from '@/features/prompts/types';
import { useDebouncedValue } from '@/hooks/use-debounce';
import type { ActionError } from '@/lib/action';
import { handleUnauthorizedResult } from '@/lib/action-client';
import { APP_ERROR_CODES } from '@/lib/errors';

const PAGE_SIZE = 50;

type PromptListClientProps = {
  initialData: PromptListResult;
};

export function PromptListClient({ initialData }: PromptListClientProps) {
  const initialPayload = initialData.ok
    ? initialData.data
    : { items: [], hasMore: false, nextOffset: null };
  const [items, setItems] = React.useState<PromptListItem[]>(initialPayload.items);
  const [hasMore, setHasMore] = React.useState(initialPayload.hasMore);
  const [nextOffset, setNextOffset] = React.useState<number | null>(initialPayload.nextOffset);
  const [error, setError] = React.useState<ActionError | null>(
    initialData.ok ? null : initialData.error,
  );
  const [loading, setLoading] = React.useState(false);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [drawerMode, setDrawerMode] = React.useState<PromptDrawerMode>('create');
  const [activePrompt, setActivePrompt] = React.useState<PromptListItem | null>(null);

  const authRequired = error?.code === APP_ERROR_CODES.UNAUTHORIZED;
  const authMessage = authRequired ? (error?.message ?? null) : null;
  const errorMessage = !authRequired ? (error?.message ?? null) : null;

  React.useEffect(() => {
    if (!initialData.ok) {
      handleUnauthorizedResult(initialData);
    }
  }, [initialData]);

  const debouncedQuery = useDebouncedValue(query, 400);
  const debouncedTags = useDebouncedValue(selectedTags, 400);
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);
  const queryKey = React.useMemo(
    () => `${debouncedQuery}::${debouncedTags.join(',')}`,
    [debouncedQuery, debouncedTags],
  );
  const queryKeyRef = React.useRef(queryKey);

  React.useEffect(() => {
    queryKeyRef.current = queryKey;
  }, [queryKey]);

  const refreshList = React.useCallback(async () => {
    setLoading(true);
    const key = queryKey;
    const result = await listPrompts({
      query: debouncedQuery,
      tagNames: debouncedTags,
      offset: 0,
      limit: PAGE_SIZE,
    });
    if (queryKeyRef.current !== key) {
      setLoading(false);
      return;
    }
    if (!result.ok) {
      handleUnauthorizedResult(result);
      setError(result.error);
      setItems([]);
      setHasMore(false);
      setNextOffset(null);
      setLoading(false);
      return;
    }
    setError(null);
    setItems(result.data.items);
    setHasMore(result.data.hasMore);
    setNextOffset(result.data.nextOffset ?? null);
    setLoading(false);
  }, [debouncedQuery, debouncedTags, queryKey]);

  const loadMore = React.useCallback(async () => {
    if (loadingMore || loading || !hasMore || error) {
      return;
    }
    setLoadingMore(true);
    const key = queryKeyRef.current;
    const offset = nextOffset ?? items.length;
    const result = await listPrompts({
      query: debouncedQuery,
      tagNames: debouncedTags,
      offset,
      limit: PAGE_SIZE,
    });
    if (queryKeyRef.current !== key) {
      setLoadingMore(false);
      return;
    }
    if (!result.ok) {
      handleUnauthorizedResult(result);
      setError(result.error);
      setHasMore(false);
      setLoadingMore(false);
      return;
    }
    setError(null);
    setItems((prev) => [...prev, ...result.data.items]);
    setHasMore(result.data.hasMore);
    setNextOffset(result.data.nextOffset ?? null);
    setLoadingMore(false);
  }, [
    error,
    debouncedQuery,
    debouncedTags,
    hasMore,
    items.length,
    loading,
    loadingMore,
    nextOffset,
  ]);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      { rootMargin: '200px' },
    );
    const target = sentinelRef.current;
    if (target) {
      observer.observe(target);
    }
    return () => {
      observer.disconnect();
    };
  }, [loadMore]);

  const didMountRef = React.useRef(false);
  React.useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    void refreshList();
  }, [refreshList]);

  const openCreate = () => {
    setActivePrompt(null);
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const openPrompt = (prompt: PromptListItem) => {
    setActivePrompt(prompt);
    setDrawerMode('view');
    setDrawerOpen(true);
  };

  const handleSaved = () => {
    void refreshList();
  };

  const handleDeleted = () => {
    void refreshList();
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Prompt Library</h1>
            <p className="text-muted-foreground text-sm">Create, tag, and search prompts.</p>
          </div>
          <Button type="button" onClick={openCreate} disabled={authRequired}>
            New Prompt
          </Button>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-start">
          <div className="w-full md:w-1/2">
            <TagPicker
              value={selectedTags}
              onChangeAction={setSelectedTags}
              placeholder="Filter tags"
              allowCreate={false}
              disabled={authRequired}
              className="w-full"
            />
          </div>
          <div className="flex w-full items-center gap-2 md:w-1/2">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title or content"
              disabled={authRequired}
            />
            {loading ? <Spinner className="size-4" /> : null}
          </div>
        </div>

        {authRequired ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Sign in required</EmptyTitle>
              <EmptyDescription>{authMessage ?? 'Please sign in to continue.'}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <OneTapGate />
              <Button type="button" variant="outline" onClick={() => void refreshList()}>
                Refresh
              </Button>
            </EmptyContent>
          </Empty>
        ) : errorMessage ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Something went wrong</EmptyTitle>
              <EmptyDescription>{errorMessage}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button type="button" variant="outline" onClick={() => void refreshList()}>
                Retry
              </Button>
            </EmptyContent>
          </Empty>
        ) : items.length === 0 && !loading ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No prompts yet</EmptyTitle>
              <EmptyDescription>Create your first prompt to get started.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button type="button" onClick={openCreate}>
                Create Prompt
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="flex flex-col gap-4">
            {items.map((prompt) => (
              <button
                key={prompt.id}
                type="button"
                className="text-left"
                onClick={() => openPrompt(prompt)}
              >
                <Card className="transition hover:shadow-sm">
                  <CardHeader>
                    <CardTitle>{prompt.title || 'Untitled'}</CardTitle>
                    <CardDescription>
                      Updated {new Date(prompt.updatedAt).toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-foreground/80 max-h-24 overflow-hidden text-sm leading-relaxed">
                      {prompt.content}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {prompt.tags.length > 0 ? (
                        prompt.tags.map((tag) => (
                          <Badge key={tag.id} variant="outline">
                            {tag.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-xs">No tags</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </button>
            ))}
            <div ref={sentinelRef} className="h-6" />
            {loadingMore ? (
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Spinner className="size-4" />
                Loading more
              </div>
            ) : null}
            {!loadingMore && !hasMore && items.length > 0 ? (
              <div className="text-muted-foreground text-sm">No more prompts</div>
            ) : null}
          </div>
        )}
      </div>
      <PromptDrawer
        open={drawerOpen}
        mode={drawerMode}
        prompt={activePrompt}
        onOpenChangeAction={setDrawerOpen}
        onModeChangeAction={setDrawerMode}
        onSavedAction={handleSaved}
        onDeletedAction={handleDeleted}
      />
    </div>
  );
}
