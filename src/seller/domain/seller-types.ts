export const SELLER_STATUSES = ['DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'REJECTED', 'SUSPENDED'] as const;
export type SellerStatus = (typeof SELLER_STATUSES)[number];

export const SELLER_TEAM_ROLES = ['OWNER', 'MANAGER', 'OPERATIONS', 'FINANCE'] as const;
export type SellerTeamRole = (typeof SELLER_TEAM_ROLES)[number];

export const SELLER_TEAM_MEMBER_STATUSES = ['INVITED', 'ACTIVE', 'DISABLED'] as const;
export type SellerTeamMemberStatus = (typeof SELLER_TEAM_MEMBER_STATUSES)[number];

export const POLICY_WARNING_SEVERITIES = ['LOW', 'MEDIUM', 'HIGH'] as const;
export type PolicyWarningSeverity = (typeof POLICY_WARNING_SEVERITIES)[number];

