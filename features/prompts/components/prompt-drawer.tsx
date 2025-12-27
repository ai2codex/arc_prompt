'use client';

import * as React from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createPrompt, deletePrompt, updatePrompt } from '@/features/prompts/actions';
import { TagPicker } from '@/features/prompts/components/tag-picker';
import type { PromptListItem } from '@/features/prompts/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { handleUnauthorizedResult } from '@/lib/action-client';
import { cn } from '@/lib/ui';

export type PromptDrawerMode = 'create' | 'view' | 'edit';

type PromptDrawerProps = {
  open: boolean;
  mode: PromptDrawerMode;
  prompt?: PromptListItem | null;
  onOpenChangeAction: (open: boolean) => void;
  onModeChangeAction?: (mode: PromptDrawerMode) => void;
  onSavedAction?: (promptId?: string) => void;
  onDeletedAction?: (promptId: string) => void;
};

export function PromptDrawer({
  open,
  mode,
  prompt,
  onOpenChangeAction,
  onModeChangeAction,
  onSavedAction,
  onDeletedAction,
}: PromptDrawerProps) {
  const isMobile = useIsMobile();
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [tags, setTags] = React.useState<string[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      return;
    }
    setCopied(false);
    if (mode === 'create') {
      setTitle('');
      setContent('');
      setTags([]);
      setError(null);
      return;
    }
    if (prompt) {
      setTitle(prompt.title ?? '');
      setContent(prompt.content ?? '');
      setTags(prompt.tags.map((tag) => tag.name));
      setError(null);
    }
  }, [open, mode, prompt]);

  const handleSaveAction = async () => {
    setSaving(true);
    setError(null);
    if (mode === 'edit' && !prompt) {
      setSaving(false);
      setError('Prompt is missing.');
      return;
    }
    const payload = {
      title,
      content,
      tags,
    };
    const result =
      mode === 'edit' && prompt
        ? await updatePrompt({ ...payload, id: prompt.id })
        : await createPrompt(payload);
    setSaving(false);
    if (!result.ok) {
      handleUnauthorizedResult(result);
      setError(result.error.message ?? 'Save failed.');
      return;
    }
    if (mode === 'edit' && onModeChangeAction) {
      onModeChangeAction('view');
    }
    if (mode === 'create') {
      onOpenChangeAction(false);
    }
    onSavedAction?.(result.data?.id);
  };

  const handleDeleteAction = async () => {
    if (!prompt) {
      return;
    }
    setDeleting(true);
    const result = await deletePrompt(prompt.id);
    setDeleting(false);
    if (!result.ok) {
      handleUnauthorizedResult(result);
      setError(result.error.message ?? 'Delete failed.');
      return;
    }
    onOpenChangeAction(false);
    onDeletedAction?.(prompt.id);
  };

  const handleCopy = async () => {
    if (!prompt?.content) {
      return;
    }
    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError('Copy failed.');
    }
  };

  const readOnly = mode === 'view';
  const drawerTitle = mode === 'create' ? 'New Prompt' : mode === 'edit' ? 'Edit Prompt' : 'Prompt';

  return (
    <Drawer open={open} onOpenChange={onOpenChangeAction} direction={isMobile ? 'bottom' : 'right'}>
      <DrawerContent
        className={cn(
          'data-[vaul-drawer-direction=bottom]:h-[80vh] data-[vaul-drawer-direction=right]:w-[40vw] data-[vaul-drawer-direction=right]:max-w-none',
        )}
      >
        <DrawerHeader>
          <DrawerTitle>{drawerTitle}</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
          {readOnly && prompt ? (
            <>
              <div className="space-y-1">
                <div className="text-muted-foreground text-xs uppercase">Title</div>
                <div className="text-base font-medium">{prompt.title || 'Untitled'}</div>
              </div>
              <div className="space-y-2">
                <div className="text-muted-foreground text-xs uppercase">Tags</div>
                <div className="flex flex-wrap gap-2">
                  {prompt.tags.length > 0 ? (
                    prompt.tags.map((tag) => (
                      <Badge key={tag.id} variant="secondary">
                        {tag.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-sm">No tags</span>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-muted-foreground text-xs uppercase">Content</div>
                <div className="border-muted relative rounded-lg border p-3 text-sm leading-relaxed whitespace-pre-wrap">
                  {prompt.content}
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => void handleCopy()}
                    className="absolute right-2 bottom-2"
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>
              <div className="grid gap-2 text-sm">
                <div className="text-muted-foreground">
                  Created: {new Date(prompt.createdAt).toLocaleString()}
                </div>
                <div className="text-muted-foreground">
                  Updated: {new Date(prompt.updatedAt).toLocaleString()}
                </div>
                <div className="text-muted-foreground">
                  User: {prompt.userName || prompt.userId}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-muted-foreground text-xs uppercase" htmlFor="prompt-title">
                  Title (optional)
                </label>
                <Input
                  id="prompt-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Optional title"
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <label className="text-muted-foreground text-xs uppercase" htmlFor="prompt-tags">
                  Tags (optional)
                </label>
                <TagPicker
                  value={tags}
                  onChangeAction={setTags}
                  allowCreate
                  placeholder="Search or create tags"
                  disabled={saving}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label className="text-muted-foreground text-xs uppercase" htmlFor="prompt-content">
                  Content
                </label>
                <Textarea
                  id="prompt-content"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="Enter prompt content"
                  rows={8}
                  disabled={saving}
                />
              </div>
            </>
          )}
          {error ? <div className="text-destructive text-sm">{error}</div> : null}
        </div>
        <DrawerFooter>
          {mode === 'view' ? (
            <>
              <div className="flex flex-1 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onModeChangeAction?.('edit')}
                >
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="destructive">
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete prompt?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. The prompt will be soft deleted.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        variant="destructive"
                        onClick={() => void handleDeleteAction()}
                        disabled={deleting}
                      >
                        {deleting ? 'Deleting...' : 'Delete'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <DrawerClose asChild>
                <Button type="button" variant="ghost">
                  Close
                </Button>
              </DrawerClose>
            </>
          ) : (
            <>
              <Button type="button" onClick={() => void handleSaveAction()} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <DrawerClose asChild>
                <Button type="button" variant="ghost" disabled={saving}>
                  Cancel
                </Button>
              </DrawerClose>
            </>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
