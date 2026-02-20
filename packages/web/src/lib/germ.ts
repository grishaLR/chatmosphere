export const GERM_DECLARATION_NSID = 'com.germnetwork.declaration';

export interface GermMessageMe {
  showButtonTo: 'everyone' | 'usersIFollow' | 'none';
  messageMeUrl: string;
}

export interface GermDeclaration {
  $type: typeof GERM_DECLARATION_NSID;
  messageMe: GermMessageMe;
}

export function buildGermUrl(messageMeUrl: string, targetDid: string, viewerDid: string): string {
  // Strip trailing slash before appending fragment
  const base = messageMeUrl.replace(/\/+$/, '');
  return `${base}/web#${targetDid}+${viewerDid}`;
}
