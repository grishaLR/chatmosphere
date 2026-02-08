/** Resolves DID creation dates from the PLC directory. Caches results. */

const PLC_DIRECTORY = 'https://plc.directory';
const cache = new Map<string, Date>();

interface PlcAuditEntry {
  createdAt: string;
}

export async function getDidCreationDate(did: string): Promise<Date | null> {
  const cached = cache.get(did);
  if (cached) return cached;

  // Only did:plc is supported via PLC directory
  if (!did.startsWith('did:plc:')) return null;

  try {
    const res = await fetch(`${PLC_DIRECTORY}/${did}/log/audit`);
    if (!res.ok) return null;

    const entries = (await res.json()) as PlcAuditEntry[];
    const first = entries[0];
    if (!first?.createdAt) return null;

    const date = new Date(first.createdAt);
    cache.set(did, date);
    return date;
  } catch {
    return null;
  }
}

export function getAccountAgeDays(creationDate: Date): number {
  const now = Date.now();
  const diff = now - creationDate.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
