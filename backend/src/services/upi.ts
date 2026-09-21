/** NPCI UPI VPA: local-part @ handle. Owner's personal UPI, not a payment gateway. */
const VPA_RE = /^[a-z0-9._-]{2,256}@[a-z0-9]{2,64}$/;
/** IMPS/UPI RRN / bank UTR. Banks print 12 digits; some apps show 8–22 alphanumerics. */
const UTR_RE = /^[A-Z0-9]{8,22}$/;

export const normalizeVpa = (vpa: string) => String(vpa || '').trim().toLowerCase();

export const isValidVpa = (vpa: string) => VPA_RE.test(normalizeVpa(vpa));

export const normalizeUtr = (utr: string) => String(utr || '').trim().toUpperCase().replace(/\s+/g, '');

export const isValidUtr = (utr: string) => UTR_RE.test(normalizeUtr(utr));

export const makeUpiReference = (now = Date.now()) => `BS${String(now).slice(-10)}`;

export const buildUpiIntent = (opts: {
  vpa: string;
  payeeName: string;
  amount: number;
  note: string;
}) => {
  const pa = normalizeVpa(opts.vpa);
  if (!isValidVpa(pa)) throw new Error('UPI ID is not valid. Use a handle like name@okaxis.');
  const amount = Number(opts.amount);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Amount must be greater than 0');
  const pn = encodeURIComponent(opts.payeeName || 'Buddy Search');
  const tn = encodeURIComponent(opts.note || 'BuddySearch');
  return `upi://pay?pa=${pa}&pn=${pn}&am=${amount}&cu=INR&tn=${tn}`;
};
