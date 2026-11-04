import { z } from 'zod';

export const API_PREFIX = '/api/v1';

export const HealthResponseSchema = z.strictObject({
  status: z.literal('ok'),
  service: z.literal('finpath-api'),
});

export const HealthCheckRequestSchema = z.strictObject({
  check: z.literal('health'),
});

export const EmptyQuerySchema = z.strictObject({});

export const ErrorCodeSchema = z.enum([
  'INVALID_REQUEST',
  'UNAUTHENTICATED',
  'NOT_FOUND',
  'CONFLICT',
  'UNPROCESSABLE_ENTITY',
  'SERVICE_UNAVAILABLE',
  'INTERNAL_ERROR',
]);

const CurrencySchema = z.enum(['CAD', 'CNY', 'JPY']);
const JournalKindSchema = z.enum([
  'income',
  'expense',
  'transfer',
  'refund',
  'reversal',
  'loan_payment',
  'card_settlement',
  'opening_balance',
]);
const AmountSchema = z.strictObject({
  amountMinor: z.string().regex(/^(0|[1-9]\d*)$/),
  currency: CurrencySchema,
});
const TimestampSchema = z.iso.datetime({ offset: false });
const DescriptionSchema = z.string().trim().min(1).max(200);

export const AccountResponseSchema = z.strictObject({
  id: z.string().min(1),
  name: z.string().min(1),
  kind: z.enum(['asset', 'liability', 'equity', 'income', 'expense']),
  currency: CurrencySchema,
  liquidityClass: z.string().nullable(),
});

const TransactionBaseShape = {
  occurredAt: TimestampSchema,
  description: DescriptionSchema,
  amount: AmountSchema,
};

export const CreateTransactionRequestSchema = z.discriminatedUnion('kind', [
  z.strictObject({
    kind: z.literal('income'),
    ...TransactionBaseShape,
    cashAccountId: z.string().min(1),
    incomeAccountId: z.string().min(1),
  }),
  z.strictObject({
    kind: z.literal('expense'),
    ...TransactionBaseShape,
    expenseAccountId: z.string().min(1),
    paymentAccountId: z.string().min(1),
  }),
  z.strictObject({
    kind: z.literal('transfer'),
    ...TransactionBaseShape,
    fromAccountId: z.string().min(1),
    toAccountId: z.string().min(1),
  }),
]);

export const PostingResponseSchema = z.strictObject({
  id: z.string().min(1),
  accountId: z.string().min(1),
  side: z.enum(['debit', 'credit']),
  amount: AmountSchema,
});

export const TransactionResponseSchema = z.strictObject({
  id: z.string().min(1),
  kind: JournalKindSchema,
  occurredAt: TimestampSchema,
  status: z.enum(['posted', 'reversed']),
  description: DescriptionSchema,
  reversalOfId: z.string().nullable(),
  postings: z.array(PostingResponseSchema).min(2),
});

export const TransactionPageResponseSchema = z.strictObject({
  items: z.array(TransactionResponseSchema),
  nextCursor: z.string().nullable(),
});

export const TransactionQuerySchema = z.strictObject({
  pageSize: z
    .string()
    .regex(/^[1-9]\d{0,2}$/)
    .optional(),
  cursor: z.string().min(1).max(512).optional(),
});

export const ApiErrorResponseSchema = z.strictObject({
  error: z.strictObject({
    code: ErrorCodeSchema,
    message: z.string().min(1).max(160),
    details: z.strictObject({}),
    requestId: z.uuid(),
  }),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;
export type HealthCheckRequest = z.infer<typeof HealthCheckRequestSchema>;
export type ErrorCode = z.infer<typeof ErrorCodeSchema>;
export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;

// Public messages are fixed here. Exception text and input values stay private.
export const API_ERRORS = {
  INVALID_REQUEST: { status: 400, message: 'Invalid request.' },
  UNAUTHENTICATED: { status: 401, message: 'Authentication required.' },
  NOT_FOUND: { status: 404, message: 'Resource not found.' },
  CONFLICT: { status: 409, message: 'The request conflicts with existing data.' },
  UNPROCESSABLE_ENTITY: { status: 422, message: 'The requested transaction is invalid.' },
  SERVICE_UNAVAILABLE: { status: 503, message: 'The financial service is unavailable.' },
  INTERNAL_ERROR: { status: 500, message: 'An unexpected error occurred.' },
} as const satisfies Record<ErrorCode, { status: number; message: string }>;

export type AccountResponse = z.infer<typeof AccountResponseSchema>;
export type CreateTransactionRequest = z.infer<typeof CreateTransactionRequestSchema>;
export type TransactionResponse = z.infer<typeof TransactionResponseSchema>;
export type TransactionPageResponse = z.infer<typeof TransactionPageResponseSchema>;
