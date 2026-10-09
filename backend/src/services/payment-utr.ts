/** A bank UTR identifies one transfer. FAILED rows must not consume it. */

export const UTR_LIVE_STATUSES = ['PENDING', 'SUCCESS'] as const;

export const utrClashWhere = (utr: string, exceptPaymentId: string) => ({
  upiUtr: utr,
  id: { not: exceptPaymentId },
  status: { in: [...UTR_LIVE_STATUSES] },
});

/** Unique only while the row can still capture the transfer. Rejected UTRs stay visible for audit. */
export const UPI_UTR_LIVE_UNIQUE_INDEX = {
  key: { upiUtr: 1 as const },
  name: 'upiUtr_live_unique',
  unique: true,
  partialFilterExpression: {
    upiUtr: { $type: 'string' as const },
    status: { $in: [...UTR_LIVE_STATUSES] },
  },
};
