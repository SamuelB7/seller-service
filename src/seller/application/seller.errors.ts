export type SellerErrorCode = 'SELLER_NOT_FOUND' | 'APPLICATION_NOT_FOUND' | 'TEAM_MEMBER_NOT_FOUND' | 'FORBIDDEN';

export class SellerApplicationError extends Error {
  constructor(
    readonly code: SellerErrorCode,
    message: string
  ) {
    super(message);
  }
}

export const sellerError = (code: SellerErrorCode, message: string) => new SellerApplicationError(code, message);

