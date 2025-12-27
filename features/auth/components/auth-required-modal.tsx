'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { OneTapGate } from '@/features/auth/components/one-tap-gate';
import { useAuthModalStore } from '@/features/auth/store';

const DEFAULT_MESSAGE = 'Please sign in to continue.';

export function AuthRequiredModal() {
  const { open, message, closeModal } = useAuthModalStore();

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          closeModal();
        }
      }}
    >
      <DialogContent
        onInteractOutside={(event) => void event.preventDefault()}
        onEscapeKeyDown={(event) => void event.preventDefault()}
        onOpenAutoFocus={(event) => void event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Sign in required</DialogTitle>
          <DialogDescription>{message ?? DEFAULT_MESSAGE}</DialogDescription>
        </DialogHeader>
        <OneTapGate compact />
      </DialogContent>
    </Dialog>
  );
}
