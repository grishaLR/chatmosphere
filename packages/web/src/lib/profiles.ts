export interface ProfileInfo {
  did: string;
  handle: string;
  displayName?: string;
  avatarUrl?: string;
}

const BATCH_SIZE = 25;
const PUBLIC_API = 'https://public.api.bsky.app/xrpc/app.bsky.actor.getProfiles';

export async function fetchProfiles(dids: string[]): Promise<ProfileInfo[]> {
  const results: ProfileInfo[] = [];

  for (let i = 0; i < dids.length; i += BATCH_SIZE) {
    const batch = dids.slice(i, i + BATCH_SIZE);
    const params = new URLSearchParams();
    for (const did of batch) {
      params.append('actors', did);
    }

    const res = await fetch(`${PUBLIC_API}?${params.toString()}`);
    if (!res.ok) continue;

    const data = (await res.json()) as {
      profiles: Array<{
        did: string;
        handle: string;
        displayName?: string;
        avatar?: string;
      }>;
    };

    for (const profile of data.profiles) {
      results.push({
        did: profile.did,
        handle: profile.handle,
        displayName: profile.displayName || undefined,
        avatarUrl: profile.avatar || undefined,
      });
    }
  }

  return results;
}
