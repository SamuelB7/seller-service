# seller-service

Responsible for seller onboarding, store profiles, KYC, seller users, and seller status.

Seller onboarding and store management service built with NestJS, Prisma, PostgreSQL, JWT validation, and Kafka integration events.

## Project Origin

This microservice is part of the [ecommerce-eda](https://github.com/SamuelB7/ecommerce-eda) event-driven marketplace platform.

## Endpoints

- `GET /health`
- `POST /events/demo`
- `POST /sellers/me/application`
- `GET /sellers/me/status`
- `POST /sellers/me/kyc-documents`
- `GET /sellers/me/kyc-documents`
- `GET /sellers/me/store-profile`
- `PUT /sellers/me/store-profile`
- `GET /sellers/me/payout-account`
- `PUT /sellers/me/payout-account`
- `GET /sellers/me/team-members`
- `POST /sellers/me/team-members`
- `PUT /sellers/me/team-members/:memberId`
- `DELETE /sellers/me/team-members/:memberId`
- `GET /sellers/me/fulfillment-settings`
- `PUT /sellers/me/fulfillment-settings`
- `GET /sellers/me/account-health`
- `GET /admin/sellers/applications`
- `PUT /admin/sellers/:sellerId/status`

## Prisma

```bash
npm run prisma:generate
npm run prisma:migrate:dev
```

## Demo Topic

- `seller.demo.event.v1`

## Integration Events

Consumed:

- `auth.user.registered.v1`

Stored in outbox:

- `seller.application.submitted.v1`
- `seller.kyc_document.submitted.v1`
- `seller.profile.updated.v1`
- `seller.payout_account.updated.v1`
- `seller.team_member.invited.v1`
- `seller.team_member.updated.v1`
- `seller.team_member.removed.v1`
- `seller.fulfillment_settings.updated.v1`
- `seller.approved.v1`
- `seller.rejected.v1`
- `seller.suspended.v1`
- `seller.reactivated.v1`
