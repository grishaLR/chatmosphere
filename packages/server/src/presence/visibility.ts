import type { PresenceStatus, PresenceVisibility } from '@protoimsg/shared';

/**
 * Determine if a requesting user can see the target's real presence status.
 *
 * @param targetVisibility - target user's visibleTo setting
 * @param targetStatus - target user's actual status
 * @param isCommunityMember - whether the requester is in target's community list
 * @param isInnerCircle - whether the requester is in target's inner circle
 * @returns the status to show to the requester
 */
export function resolveVisibleStatus(
  targetVisibility: PresenceVisibility,
  targetStatus: PresenceStatus,
  isCommunityMember: boolean,
  isInnerCircle: boolean,
): PresenceStatus {
  switch (targetVisibility) {
    case 'everyone':
      return targetStatus;
    case 'community':
      return isCommunityMember ? targetStatus : 'offline';
    case 'inner-circle':
      return isInnerCircle ? targetStatus : 'offline';
    case 'no-one':
      return 'offline';
  }
}
