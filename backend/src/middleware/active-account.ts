export type ActiveAccountFail = {
  ok: false;
  status: 401 | 403;
  message: string;
};

export type ActiveAccountOk = { ok: true };

export type ActiveAccountResult = ActiveAccountOk | ActiveAccountFail;

/** JWT is still valid for up to 30 days after an admin ban or delete. */
export const evaluateAccount = (
  user: { banned?: boolean | null } | null | undefined,
): ActiveAccountResult => {
  if (!user) {
    return { ok: false, status: 401, message: 'Invalid or expired token' };
  }
  if (user.banned) {
    return { ok: false, status: 403, message: 'This account has been suspended' };
  }
  return { ok: true };
};
