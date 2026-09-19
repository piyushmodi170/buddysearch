export const RATE_OFFER_PREFIX = 'RATE_OFFER:';

export function encodeRateOffer(amount: number) {
  return `${RATE_OFFER_PREFIX}${amount}`;
}

export function parseRateOffer(text?: string | null) {
  if (!text || !text.startsWith(RATE_OFFER_PREFIX)) return null;
  const amount = Number(text.slice(RATE_OFFER_PREFIX.length));
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return amount;
}

export function previewMessage(text?: string | null) {
  const amount = parseRateOffer(text);
  if (amount) return `Rate offer · ₹${amount}`;
  return text || 'No messages yet';
}

export function formatChatTime(value?: string | Date | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
