import type { SessionUser } from '@/features/auth/types';
import type { User } from 'better-auth';

export function toSessionUser(user?: User | null): SessionUser | null {
  if (!user?.id) {
    return null;
  }

  return {
    id: user.id,
    name: user.name ?? user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    image: user.image,
  };
}
