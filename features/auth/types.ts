import type { User } from 'better-auth';

export type SessionUser = Pick<User, 'id' | 'name' | 'email' | 'createdAt' | 'updatedAt' | 'image'>;
