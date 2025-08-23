'use client';

import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';

export interface CurrentUserInfo {
  name: string;
  initials: string;
  image: string | null;
}

export function getInitials(name?: string | null): string {
  const safe = (name || '').trim();
  if (!safe) return 'U';
  const parts = safe.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return (
    parts[0].slice(0, 1) + parts[parts.length - 1].slice(0, 1)
  ).toUpperCase();
}

export function getFirstName(name?: string | null): string {
  const safe = (name || '').trim();
  if (!safe) return 'there';
  return safe.split(/\s+/)[0];
}

export function useCurrentUser(): {
  currentUser: CurrentUserInfo;
  getInitials: typeof getInitials;
  getFirstName: typeof getFirstName;
} {
  const { session } = useAuth();

  const currentUser = useMemo<CurrentUserInfo>(() => {
    const userName = session?.user?.name || 'Unknown';
    const initials = getInitials(session?.user?.name);
    const image =
      (session?.user as { image?: string | null } | null)?.image ?? null;
    return { name: userName, initials, image };
  }, [session?.user]);

  return { currentUser, getInitials, getFirstName };
}
