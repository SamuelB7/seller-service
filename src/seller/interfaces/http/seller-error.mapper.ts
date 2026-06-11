import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { SellerApplicationError } from '../../application/seller.errors';

export function mapSellerError(error: unknown): never {
  if (!(error instanceof SellerApplicationError)) {
    throw error;
  }

  if (error.code === 'FORBIDDEN') {
    throw new ForbiddenException(error.message);
  }

  throw new NotFoundException(error.message);
}

