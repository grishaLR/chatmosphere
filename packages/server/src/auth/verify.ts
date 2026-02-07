const DID_RE = /^did:(plc|web):[a-zA-Z0-9._:%-]+$/;

export function isValidDid(did: string): boolean {
  return DID_RE.test(did);
}

interface ResolveHandleResponse {
  did: string;
}

export async function verifyDidHandle(
  did: string,
  handle: string,
  publicApiUrl: string,
): Promise<boolean> {
  if (!isValidDid(did)) return false;

  try {
    const url = `${publicApiUrl}/xrpc/com.atproto.identity.resolveHandle?handle=${encodeURIComponent(handle)}`;
    const res = await fetch(url);
    if (!res.ok) return false;

    const data = (await res.json()) as ResolveHandleResponse;
    return data.did === did;
  } catch {
    return false;
  }
}
